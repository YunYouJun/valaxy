import { computed, onMounted, shallowRef } from 'vue'
import { useSiteConfig } from 'valaxy'
import type { MaybeRefOrGetter } from '@vueuse/shared'
import type { UseFuseOptions } from '@vueuse/integrations/useFuse'
import { useFuse } from '@vueuse/integrations/useFuse'
import type { FuseListItem } from 'valaxy/types'

export function useFuseSearch<T extends FuseListItem = FuseListItem>(
  search: MaybeRefOrGetter<string>,
  options?: MaybeRefOrGetter<UseFuseOptions<T>>,
) {
  const siteConfig = useSiteConfig()

  const fuseListData = shallowRef<T[]>([])

  const keys = computed(() => {
    const ks = siteConfig.value.fuse.options.keys || []
    return ks.length === 0 ? ['title', 'tags', 'categories', 'excerpt'] : ks
  })

  const defaultOptions: UseFuseOptions<T> = {
    fuseOptions: {
      includeMatches: true,
      findAllMatches: true,
      // threshold: 0.99,
      // ignoreLocation: true,

      ...siteConfig.value.fuse.options,
      keys: keys.value,
    },
    // resultLimit: resultLimit.value,
    // matchAllWhenSearchEmpty: matchAllWhenSearchEmpty.value,
  }
  const useFuseOptions = computed<UseFuseOptions<T>>(() => ({
    ...defaultOptions,
    ...options,
  }))

  const ruse = useFuse<T>(search, fuseListData, useFuseOptions)

  async function fetchFuseListData(path?: string) {
    const fuseListDataPath = path
      || (siteConfig.value.fuse.dataPath.startsWith('http')
        ? siteConfig.value.fuse.dataPath
        : `${import.meta.env.BASE_URL}${siteConfig.value.fuse.dataPath}`)

    const res = await fetch(fuseListDataPath)
    const data = await res.json()

    if (Array.isArray(data))
      fuseListData.value = data
  }

  onMounted(fetchFuseListData)

  return ruse
}
