import type { SiteConfig } from '../../packages/valaxy/types'
import type { Post } from '../../packages/valaxy/types/posts'
import { describe, expect, it, vi } from 'vitest'
import { filterAndSortPosts } from '../../packages/valaxy/client/composables/post/filter'

const siteConfig = { orderBy: 'date' } as SiteConfig

/**
 * Inline version of usePageList sorting for testing.
 * Mirrors the `top` sort added in packages/valaxy/client/composables/post/index.ts
 */
function sortPagesByTop(pages: Post[]): Post[] {
  return pages.toSorted((a, b) => (b.top || 0) - (a.top || 0))
}

describe('page list top sorting (issue #554)', () => {
  it('should sort pages by `top` value descending', () => {
    const pages: Post[] = [
      { path: '/guide/intro', title: 'Intro' },
      { path: '/guide/setup', title: 'Setup', top: 10 },
      { path: '/guide/advanced', title: 'Advanced', top: 5 },
    ]

    const result = sortPagesByTop(pages)
    expect(result.map(p => p.title)).toEqual(['Setup', 'Advanced', 'Intro'])
  })

  it('should preserve relative order for pages without `top`', () => {
    const pages: Post[] = [
      { path: '/a', title: 'A' },
      { path: '/b', title: 'B' },
      { path: '/c', title: 'C' },
    ]

    const result = sortPagesByTop(pages)
    expect(result.map(p => p.title)).toEqual(['A', 'B', 'C'])
  })

  it('should place all topped pages before non-topped pages', () => {
    const pages: Post[] = [
      { path: '/a', title: 'Normal1' },
      { path: '/b', title: 'Topped', top: 1 },
      { path: '/c', title: 'Normal2' },
    ]

    const result = sortPagesByTop(pages)
    expect(result[0].title).toBe('Topped')
  })
})

describe('filterAndSortPosts top sorting', () => {
  function makePost(overrides: Partial<Post>): Post {
    return {
      path: '/posts/test',
      date: '2024-01-01',
      ...overrides,
    }
  }

  it('should place posts with `top` before others', () => {
    const pages: Post[] = [
      makePost({ path: '/posts/a', title: 'Normal', date: '2024-01-03' }),
      makePost({ path: '/posts/b', title: 'Pinned', date: '2024-01-01', top: 1 }),
      makePost({ path: '/posts/c', title: 'Another', date: '2024-01-02' }),
    ]

    const result = filterAndSortPosts(pages, siteConfig)
    expect(result[0].title).toBe('Pinned')
  })

  it('should sort topped posts by `top` value descending', () => {
    const pages: Post[] = [
      makePost({ path: '/posts/a', title: 'Top 1', date: '2024-01-01', top: 1 }),
      makePost({ path: '/posts/b', title: 'Top 10', date: '2024-01-02', top: 10 }),
      makePost({ path: '/posts/c', title: 'Top 5', date: '2024-01-03', top: 5 }),
    ]

    const result = filterAndSortPosts(pages, siteConfig)
    expect(result.map(p => p.title)).toEqual(['Top 10', 'Top 5', 'Top 1'])
  })

  it('should sort non-topped posts by date descending', () => {
    const pages: Post[] = [
      makePost({ path: '/posts/a', title: 'Old', date: '2024-01-01' }),
      makePost({ path: '/posts/b', title: 'New', date: '2024-01-03' }),
      makePost({ path: '/posts/c', title: 'Mid', date: '2024-01-02' }),
    ]

    const result = filterAndSortPosts(pages, siteConfig)
    expect(result.map(p => p.title)).toEqual(['New', 'Mid', 'Old'])
  })

  it('should only include posts under /posts path', () => {
    const pages: Post[] = [
      makePost({ path: '/posts/a', title: 'Post', date: '2024-01-01' }),
      makePost({ path: '/posts-archive/a', title: 'Not a post', date: '2024-01-01' }),
      makePost({ path: '/about', title: 'About', date: '2024-01-01' }),
      makePost({ path: '/guide/intro', title: 'Guide', date: '2024-01-01' }),
    ]

    const result = filterAndSortPosts(pages, siteConfig)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Post')
  })
})

describe('localized post filtering', () => {
  it('filters by locale while preserving pinned order, updated order, visibility and type', () => {
    const pages: Post[] = [
      { path: '/posts/english', date: '2026-10-04', type: 'release' },
      { path: '/zh/posts/pinned', date: '2022-04-09', top: 1, type: 'release' },
      { path: '/zh/posts/new', date: '2026-10-04', type: 'release' },
      { path: '/zh/posts/updated', date: '2022-04-09', updated: '2026-10-05', type: 'release', hide: 'index' },
      { path: '/zh/posts/hidden', date: '2026-10-04', hide: 'all', type: 'release' },
      { path: '/zh/posts/no-date', type: 'release' },
      { path: '/zh/posts/alias.html', date: '2026-10-04', type: 'release' },
      { path: '/zh/posts/note', date: '2026-10-04', type: 'note' },
      { path: '/zh/posts-archive/old', date: '2026-10-04', type: 'release' },
    ]
    const result = filterAndSortPosts(pages, { ...siteConfig, orderBy: 'updated' }, {
      pathPrefix: '/zh/posts/',
      type: 'release',
    })
    expect(result.map(post => post.path)).toEqual([
      '/zh/posts/pinned',
      '/zh/posts/updated',
      '/zh/posts/new',
    ])
  })

  it('excludes draft translations in production', () => {
    vi.stubEnv('DEV', false)
    try {
      const posts = filterAndSortPosts([
        { path: '/zh/posts/published', date: '2026-10-04' },
        { path: '/zh/posts/draft', date: '2026-10-04', draft: true },
      ], siteConfig, { pathPrefix: '/zh/posts' })
      expect(posts.map(post => post.path)).toEqual(['/zh/posts/published'])
    }
    finally {
      vi.unstubAllEnvs()
    }
  })
})
