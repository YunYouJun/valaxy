import { onBeforeMount, onMounted } from 'vue'
import { rpc } from '../rpc'

import { clientOptions, collectionList, postList } from '../stores/app'
import { fetchConfig } from '../stores/config'
import { initDevtoolsClient } from '../utils'

export function useValaxyDevtools() {
  onBeforeMount(async () => {
    clientOptions.value = await rpc.getOptions()
    postList.value = await rpc.getPostList()
    collectionList.value = await rpc.getCollectionList()
    fetchConfig()
  })

  onMounted(async () => {
    initDevtoolsClient()
  })
}
