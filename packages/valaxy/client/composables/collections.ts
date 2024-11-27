import type { CollectionConfig } from '../define'
import { ref } from 'vue'

/**
 * Composable for Collections
 * /collections/:collectionId/:slug
 * @example /collections/love-letters/1
 */
export function useCollections() {
  // TODO

  const collections = ref<CollectionConfig[]>([
    {
      id: 'i-and-she',
      name: 'I and She',
      description: 'Love letters from the past',
    },
    {
      id: 'love-and-peace',
      name: '爱与和平',
      description: 'Recipes for a good life',
    },
  ])

  return {
    collections,
  }
}
