export type MomentLikeAction = 'like' | 'unlike'

export const DEFAULT_MOMENTS_LIKE_ENDPOINT = '/api/moments-like'
export const MOMENTS_LIKE_STORAGE_KEY = 'valaxy:moments-like:v1'

const MAX_IDS_PER_REQUEST = 100

export function normalizeMomentLikeCount(value: unknown) {
  const count = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0
}

function uniqueMomentIds(ids: readonly string[]) {
  return [...new Set(ids.filter(Boolean))]
}

function withMomentIds(endpoint: string, ids: readonly string[]) {
  const separator = endpoint.includes('?') ? '&' : '?'
  return `${endpoint}${separator}ids=${ids.map(encodeURIComponent).join(',')}`
}

export async function fetchMomentLikeCounts(
  endpoint: string,
  ids: readonly string[],
  fetcher: typeof fetch = fetch,
) {
  const uniqueIds = uniqueMomentIds(ids)
  const counts: Record<string, number> = Object.fromEntries(uniqueIds.map(id => [id, 0]))

  for (let offset = 0; offset < uniqueIds.length; offset += MAX_IDS_PER_REQUEST) {
    const batch = uniqueIds.slice(offset, offset + MAX_IDS_PER_REQUEST)
    const response = await fetcher(withMomentIds(endpoint, batch), {
      headers: { Accept: 'application/json' },
      method: 'GET',
    })
    if (!response.ok)
      throw new Error(`Unable to load moments like (${response.status})`)

    const data: unknown = await response.json()
    if (!data || typeof data !== 'object' || Array.isArray(data))
      throw new TypeError('Invalid moments like response')

    for (const id of batch)
      counts[id] = normalizeMomentLikeCount((data as Record<string, unknown>)[id])
  }

  return counts
}

export async function submitMomentLike(
  endpoint: string,
  momentId: string,
  action: MomentLikeAction,
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher(endpoint, {
    body: JSON.stringify({ action, momentId }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  if (!response.ok)
    throw new Error(`Unable to update moment like (${response.status})`)

  const data: unknown = await response.json()
  if (!data || typeof data !== 'object' || Array.isArray(data) || !('count' in data))
    throw new TypeError('Invalid moment like response')

  return normalizeMomentLikeCount((data as Record<string, unknown>).count)
}

export function readLikedMomentIds(
  storage: Pick<Storage, 'getItem'>,
  key = MOMENTS_LIKE_STORAGE_KEY,
) {
  try {
    const value: unknown = JSON.parse(storage.getItem(key) || '[]')
    if (!Array.isArray(value))
      return new Set<string>()
    return new Set(value.filter((id): id is string => typeof id === 'string' && id.startsWith('/moments/')))
  }
  catch {
    return new Set<string>()
  }
}

export function writeLikedMomentIds(
  storage: Pick<Storage, 'setItem'>,
  ids: ReadonlySet<string>,
  key = MOMENTS_LIKE_STORAGE_KEY,
) {
  try {
    storage.setItem(key, JSON.stringify([...ids].sort()))
  }
  catch {
    // Likes still work when localStorage is unavailable; only persistence is lost.
  }
}
