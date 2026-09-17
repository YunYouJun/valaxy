import type { Router } from 'vue-router'
import type { ValaxyPageDebug } from './shared/debug'
import type { ValaxyPageProtocol } from './shared/page'
import type { ClientPageData } from './shared/rpc'
import { createPageScriptChannel } from 'devframe/in-page-channel'
import { PAGE_CHANNEL } from './shared/page'

export type { ValaxyPageDebug } from './shared/debug'

/** Runs in the blog page; no Vue DevTools globals or iframe-depth assumptions. */
export function createValaxyPageBridge(router: Router, options: { getDebug?: () => ValaxyPageDebug } = {}) {
  function getPage(): ClientPageData {
    const route = router.currentRoute.value
    return JSON.parse(JSON.stringify({
      routePath: route.path,
      filePath: route.meta.filePath || '',
      frontmatter: route.meta.frontmatter || {},
      debug: options.getDebug?.(),
    }))
  }

  const channel = createPageScriptChannel<ValaxyPageProtocol>({
    name: PAGE_CHANNEL,
    functions: { getPage: { type: 'query', jsonSerializable: true, handler: getPage } },
  })
  const sync = () => channel.emit('pageUpdated', getPage())
  const removeHook = router.afterEach(sync)

  return {
    sync,
    close() {
      removeHook()
      channel.close()
    },
  }
}
