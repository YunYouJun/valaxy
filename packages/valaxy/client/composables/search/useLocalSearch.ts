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

export function useLocalSearch(query: Ref<string>) {
  const results = shallowRef<LocalSearchResult[]>([])
  const loading = ref(false)
  let miniSearch: MiniSearch | null = null

  async function load(locale = 'root') {
    loading.value = true
    try {
      const searchIndex = (await import('@localSearchIndex')).default
      const loader = searchIndex[locale] ?? searchIndex[Object.keys(searchIndex)[0]]
      if (!loader) {
        loading.value = false
        return
      }
      const mod = await loader()
      const data: string = JSON.parse(mod.default)
      const { default: MiniSearchCtor } = await import('minisearch')
      miniSearch = MiniSearchCtor.loadJSON(data, {
        fields: ['title', 'titles', 'text'],
        storeFields: ['title', 'titles'],
      })
    }
    finally {
      loading.value = false
    }
  }

  watchEffect(() => {
    if (!miniSearch || !query.value.trim()) {
      results.value = []
      return
    }
    results.value = miniSearch.search(query.value, {
      prefix: true,
      fuzzy: 0.2,
      boost: { title: 4, text: 2, titles: 1 },
    }) as unknown as LocalSearchResult[]
  })

  return { results, loading, load }
}
