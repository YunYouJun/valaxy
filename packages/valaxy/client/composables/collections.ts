import type { MaybeRef } from 'vue'
import type { CollectionConfig } from '../types'
import collections from '#valaxy/blog/collections'

import { computed, unref } from 'vue'
import { useRoute } from 'vue-router'
import { usePageList } from './post'

/**
 * Composable for Collections
 * /collections/:collectionId/:slug
 * @example /collections/love-letters/1
 */
export function useCollections() {
  return {
    collections: computed<CollectionConfig[]>(() => collections),
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

/**
 * Get posts belonging to a specific collection
 * Sorted by the order defined in collection.items
 */
export function useCollectionPosts(collectionKey: MaybeRef<string>) {
  const pageList = usePageList()
  const { collections } = useCollections()

  return computed(() => {
    const key = unref(collectionKey)
    if (!key)
      return []

    const prefix = `/collections/${key}/`
    const pages = pageList.value.filter(
      p => p.path?.startsWith(prefix) && p.path !== prefix && !p.path.endsWith('/'),
    )

    // Sort by collection items order if available
    const col = collections.value.find(c => c.key === key)
    if (col?.items) {
      const order = col.items.map(item => item.key)
      return [...pages].sort((a, b) => {
        const aSlug = a.path?.split('/').pop() || ''
        const bSlug = b.path?.split('/').pop() || ''
        const aIdx = order.indexOf(aSlug)
        const bIdx = order.indexOf(bSlug)
        return (aIdx === -1 ? Infinity : aIdx) - (bIdx === -1 ? Infinity : bIdx)
      })
    }

    return pages
  })
}
