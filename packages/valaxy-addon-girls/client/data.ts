import type { GirlEntry } from '../types'

export type GirlsFetcher = (input: string, init?: RequestInit) => Promise<Response>

function optionalString(value: unknown) {
  return typeof value === 'string' && value.length ? value : undefined
}

export function normalizeGirls(raw: unknown): GirlEntry[] {
  if (!Array.isArray(raw))
    throw new TypeError('Girls data must be an array')

  return raw.map((item, index) => {
    if (!item || typeof item !== 'object')
      throw new TypeError(`Girl at index ${index} must be an object`)

    const record = item as Record<string, unknown>
    const name = optionalString(record.name)?.trim()

    if (!name)
      throw new TypeError(`Girl at index ${index} must have a name`)

    return {
      ...record,
      name,
      avatar: optionalString(record.avatar),
      from: optionalString(record.from),
      reason: optionalString(record.reason),
      url: optionalString(record.url),
    }
  })
}

export function shuffleGirls(
  entries: GirlEntry[],
  random: () => number = Math.random,
) {
  const shuffled = [...entries]

  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }

  return shuffled
}

export async function fetchGirls(
  url: string,
  options: {
    fetcher?: GirlsFetcher
    signal?: AbortSignal
  } = {},
) {
  const fetcher = options.fetcher || fetch
  const response = await fetcher(url, { signal: options.signal })

  if (!response.ok)
    throw new Error(`Failed to fetch girls: ${response.status}`)

  return normalizeGirls(await response.json())
}
