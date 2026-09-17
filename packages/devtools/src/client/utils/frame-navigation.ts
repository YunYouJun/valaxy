import type { DevToolsFrameNavFrameMessage, DevToolsFrameTab } from '@vitejs/devtools-kit/client'
import type { Router } from 'vue-router'
import { FRAME_NAV_CHANNEL, FRAME_NAV_VERSION } from '@vitejs/devtools-kit/client'
import { DEVTOOLS_FRAME_ID } from '../../shared/constants'

interface FrameNavigationWindow {
  parent: Pick<Window, 'postMessage'>
  location: Pick<Location, 'origin'>
  addEventListener: (type: 'message', listener: (event: MessageEvent) => void) => void
  removeEventListener: (type: 'message', listener: (event: MessageEvent) => void) => void
}

/** The iframe half of Hub's public, origin-locked frame-nav protocol. */
export function connectFrameNavigation(router: Router, options: {
  tabs: () => DevToolsFrameTab[]
  onError: (error: unknown) => void
  window?: FrameNavigationWindow
}) {
  const target: FrameNavigationWindow = options.window ?? window
  const origin = target.location.origin
  let disposed = false
  const current = () => options.tabs().find(tab => tab.navTarget.path === router.currentRoute.value.path)?.id

  function send(payload: Pick<DevToolsFrameNavFrameMessage, 'type'> & Record<string, unknown>) {
    if (!disposed) {
      target.parent.postMessage({
        channel: FRAME_NAV_CHANNEL,
        v: FRAME_NAV_VERSION,
        frameId: DEVTOOLS_FRAME_ID,
        from: 'frame',
        ...payload,
      }, origin)
    }
  }

  function update() {
    send({ type: 'manifest', tabs: options.tabs(), current: current() })
  }

  function onMessage(event: MessageEvent) {
    if (event.source !== target.parent || event.origin !== origin)
      return
    const message = event.data
    if (!message || message.channel !== FRAME_NAV_CHANNEL || message.v !== FRAME_NAV_VERSION
      || message.frameId !== DEVTOOLS_FRAME_ID || message.from !== 'host') {
      return
    }
    if (message.type === 'hello') {
      send({ type: 'ready', tabs: options.tabs(), current: current() })
    }
    else if (message.type === 'navigate') {
      const tab = options.tabs().find(tab => tab.id === message.tabId)
      // Route only to a declared local page. The host cannot supply arbitrary
      // URLs or replace query parameters used by Valaxy's editor/deep links.
      if (tab && tab.navTarget.path !== router.currentRoute.value.path)
        void router.push({ path: tab.navTarget.path }).catch(options.onError)
    }
  }

  target.addEventListener('message', onMessage)
  const stop = router.afterEach(() => {
    // Also restore the host highlight if a route guard cancels navigation.
    send({ type: 'navigated', tabId: current() })
  })
  void router.isReady().then(() => {
    send({ type: 'ready', tabs: options.tabs(), current: current() })
  }).catch(options.onError)

  return {
    update,
    dispose() {
      disposed = true
      target.removeEventListener('message', onMessage)
      stop()
    },
  }
}
