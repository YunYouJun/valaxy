import type { MomentEntry } from '../types'
import { describe, expect, it } from 'vitest'
import { nextTick, shallowRef } from 'vue'
import { normalizeMomentImages, normalizeMomentRoutes } from '../client/data'
import { formatMomentDate, getMomentMonth, getMomentMonthAnchorTargets, groupMomentsByYear, partitionPinnedMoments } from '../client/time'
import { useMomentsProgressiveCount } from '../client/useProgressiveCount'
import { shouldExcludeMoment } from '../node'

function moment(path: string, date: string) {
  return { path, date, content: '', images: [] } as MomentEntry
}

describe('normalizeMomentImages', () => {
  it('normalizes string and object images and drops invalid entries', () => {
    expect(normalizeMomentImages([
      ' /one.webp ',
      { src: '/two.webp', alt: ' Two ', width: 640, height: -1 },
      { src: '' },
      null,
    ])).toEqual([
      { src: '/one.webp' },
      { src: '/two.webp', alt: 'Two', width: 640, height: undefined },
    ])
  })

  it('keeps only the first nine valid images', () => {
    const images = Array.from({ length: 11 }, (_, index) => `/image-${index + 1}.webp`)
    const normalized = normalizeMomentImages(images)

    expect(normalized).toHaveLength(9)
    expect(normalized.map(image => image.src)).toEqual(images.slice(0, 9))
  })
})

describe('normalizeMomentRoutes', () => {
  it('filters non-moment, index, alias, hidden, draft, and undated routes', () => {
    const routes = [
      { path: '/moments/', meta: { momentContent: '', frontmatter: { date: '2026-01-01' } } },
      { path: '/posts/a', meta: { momentContent: '', frontmatter: { date: '2026-01-01' } } },
      { path: '/moments/alias', aliasOf: {}, meta: { momentContent: '', frontmatter: { date: '2026-01-01' } } },
      { path: '/moments/draft', meta: { momentContent: '', frontmatter: { date: '2026-01-01', draft: true } } },
      { path: '/moments/hidden', meta: { momentContent: '', frontmatter: { date: '2026-01-01', hide: 'index' as const } } },
      { path: '/moments/no-date', meta: { momentContent: '', frontmatter: {} } },
      { path: '/moments/bad-date', meta: { momentContent: '', frontmatter: { date: 'not-a-date' } } },
      { path: '/moments/ok', meta: { momentContent: '<p>OK</p>', frontmatter: { date: '2026-01-01' } } },
    ]

    expect(normalizeMomentRoutes(routes)).toHaveLength(1)
    expect(normalizeMomentRoutes(routes)[0].path).toBe('/moments/ok')
    expect(normalizeMomentRoutes(routes, { isDev: true }).map(item => item.path)).toContain('/moments/draft')
  })

  it('sorts by pin priority, date, and stable path', () => {
    const routes = [
      { path: '/moments/c', meta: { momentContent: '', frontmatter: { date: '2026-01-02' } } },
      { path: '/moments/b', meta: { momentContent: '', frontmatter: { date: '2026-01-02' } } },
      { path: '/moments/a', meta: { momentContent: '', frontmatter: { date: '2025-01-01', top: 2 } } },
    ]

    expect(normalizeMomentRoutes(routes).map(item => item.path)).toEqual([
      '/moments/a',
      '/moments/b',
      '/moments/c',
    ])
  })
})

describe('groupMomentsByYear', () => {
  it('uses the configured timezone consistently for naive and absolute dates', () => {
    expect(getMomentMonth('2026-01-01', 'America/Los_Angeles').anchor).toBe('moments-2026-01')
    expect(getMomentMonth('2026-01-01', 'Asia/Shanghai').anchor).toBe('moments-2026-01')

    expect(getMomentMonth('2026-01-01T00:30:00Z', 'America/Los_Angeles').anchor).toBe('moments-2025-12')
    expect(getMomentMonth('2026-01-01T00:30:00Z', 'Asia/Shanghai').anchor).toBe('moments-2026-01')
    expect(formatMomentDate('2026-01-01 08:30', 'Asia/Shanghai')).toBe('2026-01-01 08:30')
  })

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

describe('production filtering', () => {
  it('removes draft and hidden moment routes only from production builds', () => {
    expect(shouldExcludeMoment({ draft: true }, 'build')).toBe(true)
    expect(shouldExcludeMoment({ hide: 'index' }, 'build')).toBe(true)
    expect(shouldExcludeMoment({ draft: true }, 'dev')).toBe(false)
    expect(shouldExcludeMoment({}, 'build')).toBe(false)
  })
})

describe('useMomentsProgressiveCount', () => {
  it('shows moments in bounded batches', () => {
    const { remainingCount, showMore, visibleCount } = useMomentsProgressiveCount(26, 10, 10)

    expect(visibleCount.value).toBe(10)
    showMore()
    expect(visibleCount.value).toBe(20)
    showMore()
    expect(visibleCount.value).toBe(26)
    expect(remainingCount.value).toBe(0)
  })

  it('resets when the source changes', async () => {
    const total = shallowRef(30)
    const { showMore, visibleCount } = useMomentsProgressiveCount(total, 10, 10)
    showMore()
    total.value = 4
    await nextTick()
    expect(visibleCount.value).toBe(4)
  })
})
