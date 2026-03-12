import type { Post } from '../../packages/valaxy/types/posts'
import { describe, expect, it } from 'vitest'
import { orderByMeta } from '../../packages/valaxy/client/utils/time'

/**
 * Inline version of filterAndSortPosts for testing without virtual module deps.
 * Mirrors the logic in packages/valaxy/client/composables/post/index.ts
 */
function filterAndSortPosts(
  pages: Post[],
  orderBy: 'date' | 'updated' = 'date',
): Post[] {
  const routes = pages
    .filter(i =>
      i.path?.startsWith('/posts')
      && !i.path?.endsWith('.html')
      && i.date
      && (!i.hide || i.hide === 'index'),
    )

  const topPosts = orderByMeta(routes.filter(i => i.top), orderBy).sort((a, b) => b.top! - a.top!)
  const otherPosts = orderByMeta(routes.filter(i => !i.top), orderBy)

  return topPosts.concat(otherPosts)
}

/**
 * Inline version of usePageList sorting for testing.
 * Mirrors the `top` sort added in packages/valaxy/client/composables/post/index.ts
 */
function sortPagesByTop(pages: Post[]): Post[] {
  return [...pages].sort((a, b) => (b.top || 0) - (a.top || 0))
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

    const result = filterAndSortPosts(pages)
    expect(result[0].title).toBe('Pinned')
  })

  it('should sort topped posts by `top` value descending', () => {
    const pages: Post[] = [
      makePost({ path: '/posts/a', title: 'Top 1', date: '2024-01-01', top: 1 }),
      makePost({ path: '/posts/b', title: 'Top 10', date: '2024-01-02', top: 10 }),
      makePost({ path: '/posts/c', title: 'Top 5', date: '2024-01-03', top: 5 }),
    ]

    const result = filterAndSortPosts(pages)
    expect(result.map(p => p.title)).toEqual(['Top 10', 'Top 5', 'Top 1'])
  })

  it('should sort non-topped posts by date descending', () => {
    const pages: Post[] = [
      makePost({ path: '/posts/a', title: 'Old', date: '2024-01-01' }),
      makePost({ path: '/posts/b', title: 'New', date: '2024-01-03' }),
      makePost({ path: '/posts/c', title: 'Mid', date: '2024-01-02' }),
    ]

    const result = filterAndSortPosts(pages)
    expect(result.map(p => p.title)).toEqual(['New', 'Mid', 'Old'])
  })

  it('should only include posts under /posts path', () => {
    const pages: Post[] = [
      makePost({ path: '/posts/a', title: 'Post', date: '2024-01-01' }),
      makePost({ path: '/about', title: 'About', date: '2024-01-01' }),
      makePost({ path: '/guide/intro', title: 'Guide', date: '2024-01-01' }),
    ]

    const result = filterAndSortPosts(pages)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Post')
  })
})
