import { describe, expect, it } from 'vitest'
import { defaultIncludedRoutes, routesToPaths } from '../../packages/valaxy/node/build/ssg'

describe('routesToPaths', () => {
  it('returns ["/"] for null/undefined routes', () => {
    expect(routesToPaths(null as any)).toEqual(['/'])
    expect(routesToPaths(undefined as any)).toEqual(['/'])
  })

  it('extracts flat route paths', () => {
    const routes = [
      { path: '/' },
      { path: '/about' },
      { path: '/posts' },
    ]
    const result = routesToPaths(routes)
    expect(result).toContain('/')
    expect(result).toContain('/about')
    expect(result).toContain('/posts')
  })

  it('handles nested children with prefix', () => {
    const routes = [
      {
        path: '/blog',
        children: [
          { path: 'post-1' },
          { path: 'post-2' },
        ],
      },
    ]
    const result = routesToPaths(routes)
    expect(result).toContain('/blog')
    expect(result).toContain('/blog/post-1')
    expect(result).toContain('/blog/post-2')
  })

  it('handles absolute child paths (not prefixed)', () => {
    const routes = [
      {
        path: '/parent',
        children: [
          { path: '/absolute-child' },
        ],
      },
    ]
    const result = routesToPaths(routes)
    expect(result).toContain('/parent')
    expect(result).toContain('/absolute-child')
  })

  it('handles empty children array', () => {
    const routes = [
      { path: '/page', children: [] },
    ]
    const result = routesToPaths(routes)
    expect(result).toEqual(['/page'])
  })

  it('strips trailing slash from prefix when joining', () => {
    const routes = [
      {
        path: '/docs/',
        children: [
          { path: 'guide' },
        ],
      },
    ]
    const result = routesToPaths(routes)
    expect(result).toContain('/docs/guide')
  })
})

describe('defaultIncludedRoutes', () => {
  it('keeps static paths', () => {
    const paths = ['/', '/about', '/posts/hello']
    expect(defaultIncludedRoutes(paths)).toEqual(paths)
  })

  it('filters out paths with :param segments', () => {
    const paths = ['/', '/posts/:slug', '/users/:id/profile']
    expect(defaultIncludedRoutes(paths)).toEqual(['/'])
  })

  it('filters out paths with wildcard *', () => {
    const paths = ['/', '/catchall/*', '/404']
    expect(defaultIncludedRoutes(paths)).toEqual(['/', '/404'])
  })

  it('returns empty array when all paths are dynamic', () => {
    expect(defaultIncludedRoutes(['/posts/:id', '/*'])).toEqual([])
  })
})
