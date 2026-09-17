import type { DevframeRpcClient } from 'devframe/client'
import type {} from './node/definition'
import type { ValaxyDevtoolsData } from './shared/extensions'
import type { ValaxyPageProtocol } from './shared/page'
import type { ClientPageData } from './shared/rpc'
import type { ResourceState } from './shared/state'
import { connectDevframe } from 'devframe/client'
import { connectPanelChannel } from 'devframe/in-page-channel'
import { DEVTOOLS_PATH } from './shared/constants'
import { PAGE_CHANNEL } from './shared/page'
import { RESOURCES_STATE } from './shared/state'

export type * from './shared/extensions'

/** Connect from a registered addon panel (use hash routing and base: './'). */
export async function connectValaxyDevtools(options: Parameters<typeof connectDevframe>[0] = {}) {
  const client = await connectDevframe({ baseURL: new URL(`../../../${DEVTOOLS_PATH}`, window.location.href).href, ...options })
  return { client, data: createValaxyDevtoolsClient(client) }
}

/** Use a panel's existing connectDevframe() connection; it owns closing it. */
export function createValaxyDevtoolsClient(client: DevframeRpcClient): ValaxyDevtoolsData {
  return {
    getOptions: () => client.call('valaxy:get-options'),
    getPostList: () => client.call('valaxy:get-post-list'),
    getPageData: path => client.call('valaxy:get-page-data', path),
    getCollectionList: () => client.call('valaxy:get-collection-list'),
    getConfig: () => client.call('valaxy:get-config'),
    async onChanged(listener) {
      const state = await client.sharedState.get<ResourceState>(RESOURCES_STATE)
      return state.on('updated', listener)
    },
  }
}

/** Current page belongs to this browser, never to server-global state. */
export function onValaxyPageChanged(listener: (page: ClientPageData | undefined) => void) {
  if (window.parent === window && !window.opener) {
    listener(undefined)
    return () => {}
  }
  const channel = connectPanelChannel<ValaxyPageProtocol>({ name: PAGE_CHANNEL, functions: {}, events: { pageUpdated: {} } })
  let closed = false
  channel.on('pageUpdated', listener)
  channel.events.on('status:updated', async (status) => {
    if (status !== 'connected') {
      listener(undefined)
      return
    }
    try {
      const page = await channel.call('getPage')
      if (!closed)
        listener(page)
    }
    catch {
      if (!closed)
        listener(undefined)
    }
  })
  return () => {
    closed = true
    channel.close()
  }
}
