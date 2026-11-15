import type MiniSearch from 'minisearch'
import type { Ref } from 'vue'
import { ref, shallowRef, watchEffect } from 'vue'

export interface LocalSearchResult {
  id: string
  score: number
  terms: string[]
  title: string
  titles: string[]
}

const localSearchCache = new Map<string, MiniSearch>()
const localSearchInFlight = new Map<string, Promise<MiniSearch | null>>()

/**
 * Clear module-scoped local search caches (intended for tests or index invalidation).
 */
export function clearLocalSearchCache() {
  localSearchCache.clear()
  localSearchInFlight.clear()
}

export function useLocalSearch(query: Ref<string>) {
  const results = shallowRef<LocalSearchResult[]>([])
  const loading = ref(false)
  const miniSearch = shallowRef<MiniSearch | null>(null)
  let latestRequestId = 0

  async function load(locale = 'root') {
    const requestId = ++latestRequestId

    const cached = localSearchCache.get(locale)
    if (cached) {
      miniSearch.value = cached
      loading.value = false
      return
    }

    loading.value = true
    try {
      let pending = localSearchInFlight.get(locale)
      if (!pending) {
        pending = (async () => {
          const searchIndex = (await import('@localSearchIndex')).default
          const loader = searchIndex[locale] ?? searchIndex[Object.keys(searchIndex)[0]]
          if (!loader)
            return null
          const mod = await loader()
          const data: string = mod.default
          const { default: MiniSearchCtor } = await import('minisearch')
          const instance = MiniSearchCtor.loadJSON(data, {
            fields: ['title', 'titles', 'text'],
            storeFields: ['title', 'titles'],
          })
          localSearchCache.set(locale, instance)
          return instance
        })().finally(() => {
          localSearchInFlight.delete(locale)
        })
        localSearchInFlight.set(locale, pending)
      }

      const instance = await pending
      if (requestId === latestRequestId)
        miniSearch.value = instance
    }
    finally {
      if (requestId === latestRequestId)
        loading.value = false
    }
  }

  watchEffect(() => {
    if (!miniSearch.value || !query.value.trim()) {
      results.value = []
      return
    }
    results.value = miniSearch.value.search(query.value, {
      prefix: true,
      fuzzy: 0.2,
      boost: { title: 4, text: 2, titles: 1 },
    }) as unknown as LocalSearchResult[]
  })

  return { results, loading, load }
}
