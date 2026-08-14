import type { MomentEntry } from '../types'
import { describe, expect, it } from 'vitest'
import { getMomentMonthAnchorTargets, groupMomentsByYear, partitionPinnedMoments } from '../client/time'
import { MOMENT_LIKES_STORAGE_KEY, readMomentLiked, writeMomentLiked } from '../client/useMomentLike'

function moment(path: string, date: string) {
  return { path, date, content: '', images: [] } as MomentEntry
}

describe('groupMomentsByYear', () => {
  it('groups entries into descending years and months', () => {
    const groups = groupMomentsByYear([
      moment('/moments/c', '2026-08-13'),
      moment('/moments/b', '2025-12-01'),
      moment('/moments/a', '2026-07-02'),
    ])

    expect(groups.map(group => group.year)).toEqual([2026, 2025])
    expect(groups[0].months.map(group => group.month)).toEqual([8, 7])
    expect(groups[0].months[0].anchor).toBe('moments-2026-08')
  })

  it('keeps an older pinned entry above newer month groups', () => {
    const entries = [
      { ...moment('/moments/pinned-july', '2026-07-10'), top: 1 },
      moment('/moments/august', '2026-08-10'),
      moment('/moments/july', '2026-07-20'),
    ]
    const { pinned, regular } = partitionPinnedMoments(entries)
    const groups = groupMomentsByYear(regular)
    const renderedPaths = [
      ...pinned.map(item => item.path),
      ...groups.flatMap(year => year.months.flatMap(month => month.moments.map(item => item.path))),
    ]

    expect(renderedPaths).toEqual([
      '/moments/pinned-july',
      '/moments/august',
      '/moments/july',
    ])
  })

  it('targets the first regular moment in a month before pinned moments', () => {
    const targets = getMomentMonthAnchorTargets([
      { ...moment('/moments/pinned-july', '2026-07-14'), top: 1 },
      moment('/moments/july-13', '2026-07-13'),
      moment('/moments/july-12', '2026-07-12'),
      { ...moment('/moments/pinned-june', '2026-06-30'), top: 1 },
    ])

    expect(targets.get('moments-2026-07')).toBe('/moments/july-13')
    expect(targets.get('moments-2026-06')).toBe('/moments/pinned-june')
  })
})

describe('moment likes', () => {
  it('persists and removes one local like per path', () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    }

    writeMomentLiked(storage, '/moments/a', true)
    expect(readMomentLiked(storage, '/moments/a')).toBe(true)
    expect(JSON.parse(values.get(MOMENT_LIKES_STORAGE_KEY)!)).toEqual({ '/moments/a': true })

    writeMomentLiked(storage, '/moments/a', false)
    expect(readMomentLiked(storage, '/moments/a')).toBe(false)
  })

  it('recovers from malformed storage', () => {
    const storage = {
      getItem: () => '{bad',
      setItem: () => {},
    }
    expect(readMomentLiked(storage, '/moments/a')).toBe(false)
  })
})
