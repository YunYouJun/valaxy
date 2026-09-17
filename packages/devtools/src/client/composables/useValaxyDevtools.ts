import type { ResourceState } from '../../shared/state'
import { onMounted, onUnmounted, watch } from 'vue'
import { RESOURCES_STATE } from '../../shared/state'
import { connectionError, connectionStatus, getClient, rpc } from '../rpc'
import { clientOptions, clientPageData, collectionList, extensions, postList } from '../stores/app'
import { fetchConfig } from '../stores/config'
import { initDevtoolsClient } from '../utils'

export function useValaxyDevtools() {
  let refreshVersion = 0
  async function refresh() {
    const version = ++refreshVersion
    try {
      const [options, posts, collections, manifest] = await Promise.all([rpc.getOptions(), rpc.getPostList(), rpc.getCollectionList(), getClient().then(client => client.call('valaxy:get-extensions'))])
      if (version !== refreshVersion || connectionStatus.value !== 'connected')
        return
      clientOptions.value = options
      postList.value = posts
      collectionList.value = collections
      extensions.value = manifest
      if (clientPageData.value)
        clientPageData.value = posts.posts.find(post => post.filePath === clientPageData.value?.filePath) ?? clientPageData.value
      await fetchConfig()
    }
    catch (error) {
      connectionError.value = String(error)
    }
  }

  watch(connectionStatus, async (status, _previous, onCleanup) => {
    let cancelled = false
    let unsubscribe: (() => void) | undefined
    onCleanup(() => {
      cancelled = true
      refreshVersion++
      unsubscribe?.()
    })
    if (status !== 'connected')
      return
    try {
      const state = await (await getClient()).sharedState.get<ResourceState>(RESOURCES_STATE)
      if (cancelled)
        return
      unsubscribe = state.on('updated', () => void refresh())
      await refresh()
    }
    catch (error) {
      connectionError.value = String(error)
    }
  }, { immediate: true })

  let dispose: (() => void) | undefined
  onMounted(() => {
    dispose = initDevtoolsClient()
    void getClient().catch(() => {})
  })
  onUnmounted(() => {
    dispose?.()
  })
}
