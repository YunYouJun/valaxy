import type { ClientCollectionData, ClientOptions, ClientPageData, ClientPostList } from '../types'
import { ref } from 'vue'

export const isDevtoolsVisible = ref(false)
/**
 * base options
 */
export const clientOptions = ref<ClientOptions>({
  userRoot: '',
})

export const postList = ref<ClientPostList>({
  posts: [],
})

export const collectionList = ref<ClientCollectionData[]>([])

export const curPost = ref('')
export const clientPageData = ref<ClientPageData>()
