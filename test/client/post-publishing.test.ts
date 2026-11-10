import type { SiteConfig } from '../../packages/valaxy/types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { filterAndSortPosts } from '../../packages/valaxy/client/composables/post/filter'

const posts = [
  { path: '/posts/public', date: '2024-01-01' },
  { path: '/posts/draft', date: '2024-01-02', draft: true },
]
afterEach(() => vi.unstubAllEnvs())

describe('client post publishing', () => {
  it.each([false, true])('honors publishing.drafts=%s in production', (drafts) => {
    vi.stubEnv('DEV', false)
    const config = { orderBy: 'date', publishing: { drafts } } as SiteConfig
    expect(filterAndSortPosts(posts, config).map(post => post.path)).toEqual(
      drafts ? ['/posts/draft', '/posts/public'] : ['/posts/public'],
    )
  })

  it('previews drafts in development without an opt-in', () => {
    vi.stubEnv('DEV', true)
    expect(filterAndSortPosts(posts, { orderBy: 'date' } as SiteConfig)).toHaveLength(2)
  })
})
