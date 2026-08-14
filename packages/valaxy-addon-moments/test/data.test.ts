import { describe, expect, it } from 'vitest'
import { normalizeMomentImages, normalizeMomentRoutes } from '../client/data'

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
