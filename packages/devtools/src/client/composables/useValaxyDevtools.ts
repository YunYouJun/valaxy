import { onBeforeMount, onMounted } from 'vue'
import { rpc } from '../rpc'

import { clientOptions, postList } from '../stores/app'
import { initDevtoolsClient } from '../utils'

export function useValaxyDevtools() {
  onBeforeMount(async () => {
    clientOptions.value = await rpc.getOptions()
    postList.value = await rpc.getPostList()
  })

  onMounted(async () => {
    initDevtoolsClient()
  })
}
