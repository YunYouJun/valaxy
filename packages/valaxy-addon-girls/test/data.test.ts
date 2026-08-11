import { describe, expect, it, vi } from 'vitest'
import { fetchGirls, normalizeGirls, shuffleGirls } from '../client/data'

describe('normalizeGirls', () => {
  it('keeps custom metadata and normalizes optional fields', () => {
    expect(normalizeGirls([{
      anilist_id: 1111,
      avatar: '',
      name: ' C.C. ',
    }])).toEqual([{
      anilist_id: 1111,
      avatar: undefined,
      from: undefined,
      name: 'C.C.',
      reason: undefined,
      url: undefined,
    }])
  })

  it('rejects invalid payloads', () => {
    expect(() => normalizeGirls({})).toThrow('Girls data must be an array')
    expect(() => normalizeGirls([{}])).toThrow('Girl at index 0 must have a name')
  })
})

describe('shuffleGirls', () => {
  it('returns a shuffled copy without mutating its input', () => {
    const entries = [
      { name: 'A' },
      { name: 'B' },
      { name: 'C' },
    ]

    expect(shuffleGirls(entries, () => 0)).toEqual([
      { name: 'B' },
      { name: 'C' },
      { name: 'A' },
    ])
    expect(entries.map(entry => entry.name)).toEqual(['A', 'B', 'C'])
  })
})

describe('fetchGirls', () => {
  it('loads and normalizes remote data', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify([
      { name: 'C.C.' },
    ])))

    await expect(
      fetchGirls('https://example.com/girls.json', { fetcher }),
    ).resolves.toEqual([expect.objectContaining({ name: 'C.C.' })])
  })

  it('rejects unsuccessful responses', async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 503 }))

    await expect(
      fetchGirls('https://example.com/girls.json', { fetcher }),
    ).rejects.toThrow('Failed to fetch girls: 503')
  })
})
