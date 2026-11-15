import type { UseFuseOptions } from '@vueuse/integrations/useFuse'
import type { MaybeRefOrGetter } from 'vue'
import type { FuseListItem } from '../../../types'
import { useFuse } from '@vueuse/integrations/useFuse'
import { computed, shallowRef } from 'vue'
import { useSiteConfig } from '../../config'

const fuseDataCache = new Map<string, FuseListItem[]>()
const fuseInFlight = new Map<string, Promise<FuseListItem[]>>()

/**
 * Clear module-scoped Fuse search caches (intended for tests or cache invalidation).
 */
export function clearFuseSearchCache() {
  fuseDataCache.clear()
  fuseInFlight.clear()
}

export function useFuseSearch<T extends FuseListItem = FuseListItem>(
  search: MaybeRefOrGetter<string>,
  options?: MaybeRefOrGetter<UseFuseOptions<T>>,
) {
  const siteConfig = useSiteConfig()

  const fuseListData = shallowRef<T[]>([])
  let latestRequestId = 0

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

  const { fuse, results } = useFuse<T>(search, fuseListData, useFuseOptions)

  async function fetchFuseListData(path?: string) {
    const fuseListDataPath = path
      || (siteConfig.value.fuse.dataPath.startsWith('http')
        ? siteConfig.value.fuse.dataPath
        : `${import.meta.env.BASE_URL}${siteConfig.value.fuse.dataPath}`)

    const requestId = ++latestRequestId

    const cached = fuseDataCache.get(fuseListDataPath)
    if (cached) {
      fuseListData.value = cached as T[]
      return
    }

    let pending = fuseInFlight.get(fuseListDataPath)
    if (!pending) {
      pending = (async () => {
        const res = await fetch(fuseListDataPath)
        if (!res.ok)
          throw new Error(`Failed to fetch fuse list data (${res.status}): ${fuseListDataPath}`)
        const data = await res.json()
        const items = Array.isArray(data) ? data : []
        fuseDataCache.set(fuseListDataPath, items)
        return items
      })().finally(() => {
        fuseInFlight.delete(fuseListDataPath)
      })
      fuseInFlight.set(fuseListDataPath, pending)
    }

    const data = await pending
    if (requestId === latestRequestId)
      fuseListData.value = data as T[]
  }

  return {
    fuse,
    results,

    fetchFuseListData,
  }
}
