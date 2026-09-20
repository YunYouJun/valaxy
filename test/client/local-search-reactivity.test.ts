import MiniSearch from 'minisearch'
import { expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { useLocalSearch } from '../../packages/valaxy/client/composables/search/useLocalSearch'

const fixture = vi.hoisted(() => ({ serialized: '' }))
vi.mock('@localSearchIndex', () => ({
  default: { root: async () => ({ default: fixture.serialized }) },
}))

it('searches after an async index arrives and reacts to subsequent queries', async () => {
  const index = new MiniSearch({ fields: ['title', 'titles', 'text'], storeFields: ['title', 'titles'] })
  index.add({ id: '/guide/configuration.html', title: 'Configuration', titles: [], text: 'Set theme options.' })
  fixture.serialized = JSON.stringify(index)
  const scope = effectScope()
  try {
    const query = ref('configuration')
    const search = scope.run(() => useLocalSearch(query))!
    expect(search.results.value).toEqual([])
    await search.load()
    await nextTick()
    expect(search.results.value.map(result => result.id)).toEqual(['/guide/configuration.html'])
    query.value = 'unmatched'
    await nextTick()
    expect(search.results.value).toEqual([])
    query.value = 'theme'
    await nextTick()
    expect(search.results.value).toHaveLength(1)
  }
  finally {
    scope.stop()
  }
})
