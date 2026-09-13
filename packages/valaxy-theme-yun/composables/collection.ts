import { useCollection, usePostCollections } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

/** Resolve both collection routes and existing posts referenced by items.link. */
export function useYunCollection() {
  const route = useRoute()
  const { collection: routeCollection } = useCollection()
  const memberships = usePostCollections(computed(() => route.path))
  const collection = computed(() => routeCollection.value || memberships.value[0]?.collection)
  const currentIndex = computed(() => memberships.value.find(
    item => item.collection.key === collection.value?.key,
  )?.itemIndex ?? -1)

  return { collection, currentIndex }
}
