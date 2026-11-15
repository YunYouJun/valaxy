import MiniSearch from 'minisearch'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { clearFuseSearchCache, useFuseSearch } from '../../packages/valaxy/client/composables/search/useFuseSearch'
import { clearLocalSearchCache, useLocalSearch } from '../../packages/valaxy/client/composables/search/useLocalSearch'

const siteConfigRef = ref({
  fuse: { dataPath: 'valaxy-fuse-list.json', options: { keys: ['title'] } },
})

const searchIndexState = vi.hoisted(() => ({
  loaders: {} as Record<string, () => Promise<{ default: string }>>,
}))

vi.mock('../../packages/valaxy/client/config', () => ({
  useSiteConfig: () => siteConfigRef,
}))

vi.mock('@localSearchIndex', () => ({
  get default() {
    return searchIndexState.loaders
  },
}))

describe('batch 2 search caching & keyed concurrency', () => {
  beforeEach(() => {
    searchIndexState.loaders = {}
    clearFuseSearchCache()
    clearLocalSearchCache()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('useFuseSearch caches across remounts, deduplicates in-flight fetches, owns latest A->B->cached-A state, and recovers from errors', async () => {
    const deferredA = Promise.withResolvers<Response>()
    const deferredB = Promise.withResolvers<Response>()
    const fetchMock = vi.fn<typeof fetch>()
      .mockReturnValueOnce(deferredA.promise)
      .mockReturnValueOnce(deferredB.promise)
    vi.stubGlobal('fetch', fetchMock)

    const scope1 = effectScope()
    const query = ref('Alpha')
    const s1 = scope1.run(() => useFuseSearch(query, { fuseOptions: { keys: ['title'] } }))!
    const s1Dup = scope1.run(() => useFuseSearch(query, { fuseOptions: { keys: ['title'] } }))!

    // Concurrent same-key deduplication
    const p1 = s1.fetchFuseListData('/fuse-a.json')
    const p2 = s1Dup.fetchFuseListData('/fuse-a.json')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    deferredA.resolve(new Response(JSON.stringify([{ title: 'Alpha A', link: '/a' }]), { status: 200 }))
    await Promise.all([p1, p2])
    await nextTick()
    expect(s1.results.value.map(r => r.item.title)).toEqual(['Alpha A'])
    expect(s1Dup.results.value.map(r => r.item.title)).toEqual(['Alpha A'])
    scope1.stop()

    // Remounted instance hits cache without re-fetching, and ignores slower in-flight B after cached A
    const scope2 = effectScope()
    const s2 = scope2.run(() => useFuseSearch(query, { fuseOptions: { keys: ['title'] } }))!
    const slowB = s2.fetchFuseListData('/fuse-b.json')
    await s2.fetchFuseListData('/fuse-a.json')
    await nextTick()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(s2.results.value.map(r => r.item.title)).toEqual(['Alpha A'])

    deferredB.resolve(new Response(JSON.stringify([{ title: 'Alpha B', link: '/b' }]), { status: 200 }))
    await slowB
    await nextTick()
    expect(s2.results.value.map(r => r.item.title)).toEqual(['Alpha A'])

    // Failed fetch does not poison cache and recovers cleanly
    fetchMock.mockResolvedValueOnce(new Response('Server error', { status: 500 }))
    await expect(s2.fetchFuseListData('/fuse-err.json')).rejects.toThrow('Failed to fetch fuse list data (500)')
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([{ title: 'Alpha Retry', link: '/retry' }]), { status: 200 }))
    await s2.fetchFuseListData('/fuse-err.json')
    await nextTick()
    expect(s2.results.value.map(r => r.item.title)).toEqual(['Alpha Retry'])
    scope2.stop()
  })

  it('useLocalSearch caches across remounts, deduplicates in-flight loads, and protects loading/result ownership across A->B->cached-A', async () => {
    const buildSerialized = (id: string, title: string) => {
      const idx = new MiniSearch({ fields: ['title', 'titles', 'text'], storeFields: ['title', 'titles'] })
      idx.add({ id, title, titles: [], text: 'hello' })
      return JSON.stringify(idx)
    }

    const deferredEn = Promise.withResolvers<{ default: string }>()
    const deferredZh = Promise.withResolvers<{ default: string }>()
    const enLoader = vi.fn(() => deferredEn.promise)
    const zhLoader = vi.fn(() => deferredZh.promise)
    searchIndexState.loaders = { en: enLoader, zh: zhLoader }

    // 1. Concurrent same-key load deduplication + modal unmount/remount cache hit
    const scope1 = effectScope()
    const query = ref('Alpha')
    const l1 = scope1.run(() => useLocalSearch(query))!
    const l1Dup = scope1.run(() => useLocalSearch(query))!
    const p1 = l1.load('en')
    const p2 = l1Dup.load('en')
    await vi.waitFor(() => expect(enLoader).toHaveBeenCalledTimes(1))
    deferredEn.resolve({ default: buildSerialized('/en', 'Alpha EN') })
    await Promise.all([p1, p2])
    await nextTick()
    expect(l1.results.value.map(r => r.id)).toEqual(['/en'])
    scope1.stop()

    // 2. Cached remount + A(en)->B(zh)->cached-A(en) race condition
    const scope2 = effectScope()
    const l2 = scope2.run(() => useLocalSearch(query))!
    await l2.load('en')
    expect(enLoader).toHaveBeenCalledTimes(1)
    await nextTick()
    expect(l2.results.value.map(r => r.id)).toEqual(['/en'])

    const pendingZh = l2.load('zh')
    expect(l2.loading.value).toBe(true)

    // Switch back to cached 'en' while 'zh' is still in-flight
    await l2.load('en')
    expect(l2.loading.value).toBe(false)
    await nextTick()
    expect(l2.results.value.map(r => r.id)).toEqual(['/en'])

    // Slower 'zh' settles -> must not overwrite cached 'en' result or loading state
    deferredZh.resolve({ default: buildSerialized('/zh', 'Alpha ZH') })
    await pendingZh
    await nextTick()
    expect(l2.results.value.map(r => r.id)).toEqual(['/en'])
    expect(l2.loading.value).toBe(false)

    // 3. Rejected load leaves loading false and does not cache failure
    const errLoader = vi.fn()
      .mockRejectedValueOnce(new Error('network fail'))
      .mockResolvedValueOnce({ default: buildSerialized('/fr', 'Alpha FR') })
    searchIndexState.loaders.fr = errLoader
    await expect(l2.load('fr')).rejects.toThrow('network fail')
    expect(l2.loading.value).toBe(false)

    await l2.load('fr')
    await nextTick()
    expect(l2.results.value.map(r => r.id)).toEqual(['/fr'])
    scope2.stop()
  })
})
