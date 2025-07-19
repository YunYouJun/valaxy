import type { CollectionConfig } from '../define'
import collections from '#valaxy/blog/collections'

import { computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Composable for Collections
 * /collections/:collectionId/:slug
 * @example /collections/love-letters/1
 */
export function useCollections() {
  return {
    collections: computed(() => collections),
  }
}

/**
 * 获取当前集合
 */
export function useCollection() {
  const route = useRoute()
  const collectionId = computed(() => {
    if (route.path.startsWith('/collections/')) {
      return route.path.split('/')[2] // 获取集合 ID
    }
    return ''
  })

  const collection = computed<CollectionConfig>(() => {
    return collections.find(item => item.key === collectionId.value)
  })

  return {
    collection,
  }
}
