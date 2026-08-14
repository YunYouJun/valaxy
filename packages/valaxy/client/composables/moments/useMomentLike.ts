import type { InjectionKey, Ref } from 'vue'
import { computed, inject, onMounted, provide, reactive, readonly, ref } from 'vue'

export const MOMENT_LIKES_STORAGE_KEY = 'valaxy:moments:likes'
export const DEFAULT_MOMENT_LIKES_ENDPOINT = '/api/moment-likes'
const MOMENT_LIKES_BATCH_SIZE = 100

export type MomentLikeAction = 'like' | 'unlike'

export interface MomentLikesStore {
  counts: Record<string, number>
  enabled: Readonly<Ref<boolean>>
  endpoint: Readonly<Ref<string>>
  loading: Readonly<Ref<boolean>>
  load: (paths: string[]) => Promise<boolean>
  request: (path: string, action: MomentLikeAction) => Promise<number>
  setCount: (path: string, count: unknown) => void
}

const momentLikesStoreKey: InjectionKey<MomentLikesStore> = Symbol('valaxy:moment-likes')

export interface MomentLikeStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export function readMomentLiked(storage: MomentLikeStorage, path: string) {
  try {
    const data = JSON.parse(storage.getItem(MOMENT_LIKES_STORAGE_KEY) || '{}')
    return Boolean(data && typeof data === 'object' && data[path])
  }
  catch {
    return false
  }
}

export function writeMomentLiked(storage: MomentLikeStorage, path: string, liked: boolean) {
  let data: Record<string, boolean> = {}
  try {
    const parsed = JSON.parse(storage.getItem(MOMENT_LIKES_STORAGE_KEY) || '{}')
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
      data = parsed
  }
  catch {}

  if (liked)
    data[path] = true
  else
    delete data[path]

  try {
    storage.setItem(MOMENT_LIKES_STORAGE_KEY, JSON.stringify(data))
  }
  catch {}
}

export function normalizeMomentLikeCount(value: unknown) {
  const count = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0
}

function resolveEndpointUrl(endpoint: string) {
  const base = typeof window === 'undefined' ? 'http://localhost/' : window.location.href
  return new URL(endpoint, base)
}

export function createMomentLikesStore(
  enabled: Ref<boolean>,
  endpoint: Ref<string>,
  fetcher: typeof fetch = fetch,
): MomentLikesStore {
  const counts = reactive<Record<string, number>>({})
  const loading = ref(false)

  function setCount(path: string, count: unknown) {
    counts[path] = normalizeMomentLikeCount(count)
  }

  async function load(paths: string[]) {
    const uniquePaths = [...new Set(paths)]
    for (const path of uniquePaths)
      counts[path] ??= 0

    if (!enabled.value || !uniquePaths.length || !endpoint.value.trim())
      return false

    loading.value = true
    try {
      const batches = Array.from(
        { length: Math.ceil(uniquePaths.length / MOMENT_LIKES_BATCH_SIZE) },
        (_, index) => uniquePaths.slice(index * MOMENT_LIKES_BATCH_SIZE, (index + 1) * MOMENT_LIKES_BATCH_SIZE),
      )
      const results = await Promise.all(batches.map(async (batch) => {
        const url = resolveEndpointUrl(endpoint.value)
        url.searchParams.set('ids', batch.join(','))
        const response = await fetcher(url, {
          headers: { Accept: 'application/json' },
        })
        if (!response.ok)
          return false

        const data = await response.json() as Record<string, unknown>
        if (!data || typeof data !== 'object' || Array.isArray(data))
          return false

        for (const path of batch)
          setCount(path, data[path])
        return true
      }))
      return results.every(Boolean)
    }
    catch {
      return false
    }
    finally {
      loading.value = false
    }
  }

  async function request(path: string, action: MomentLikeAction) {
    const response = await fetcher(resolveEndpointUrl(endpoint.value), {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ action, momentId: path }),
    })
    if (!response.ok)
      throw new Error(`Moment like request failed with status ${response.status}`)

    const data = await response.json() as { count?: unknown }
    if (!data || typeof data !== 'object' || !Number.isFinite(Number(data.count)))
      throw new Error('Moment like request returned an invalid count')

    return normalizeMomentLikeCount(data.count)
  }

  return {
    counts,
    enabled: readonly(enabled),
    endpoint: readonly(endpoint),
    loading: readonly(loading),
    load,
    request,
    setCount,
  }
}

export function provideMomentLikes(store: MomentLikesStore) {
  provide(momentLikesStoreKey, store)
}

export function useMomentLike(path: string) {
  const store = inject(momentLikesStoreKey)
  const hydrated = ref(false)
  const liked = ref(false)
  const pending = ref(false)
  const enabled = computed(() => store?.enabled.value ?? false)
  const count = computed(() => store?.counts[path] ?? 0)

  onMounted(() => {
    liked.value = readMomentLiked(window.localStorage, path)
    hydrated.value = true
  })

  async function toggle() {
    if (!store || !enabled.value || !hydrated.value || pending.value || store.loading.value)
      return

    const previousLiked = liked.value
    const previousCount = count.value
    const nextLiked = !previousLiked
    liked.value = nextLiked
    store.setCount(path, previousCount + (nextLiked ? 1 : -1))
    pending.value = true

    try {
      const serverCount = await store.request(path, nextLiked ? 'like' : 'unlike')
      store.setCount(path, serverCount)
      writeMomentLiked(window.localStorage, path, nextLiked)
    }
    catch {
      liked.value = previousLiked
      store.setCount(path, previousCount)
    }
    finally {
      pending.value = false
    }
  }

  return { count, enabled, hydrated, liked, pending, toggle }
}
