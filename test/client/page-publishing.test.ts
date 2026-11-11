import { afterEach, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { usePageList, usePostList } from '../../packages/valaxy/client/composables/post'

const config = ref({ orderBy: 'date', publishing: { drafts: false } })
vi.mock('valaxy', async () => ({
  ...await import('../../packages/valaxy/client/utils/time'),
  useSiteConfig: () => config,
}))
vi.mock('#valaxy/blog/collections', () => ({ default: [] }))
vi.mock('../../packages/valaxy/client/utils', () => ({
  isLocaleKey: () => false,
  stripLocalePrefix: (value: string) => value,
  tObject: (value: unknown) => value,
}))
vi.mock('../../packages/valaxy/client/stores', () => ({
  useRouterStore: () => ({
    routes: [
      { name: 'public', path: '/posts/public', meta: { frontmatter: { date: '2024-01-01' } } },
      { name: 'draft', path: '/posts/draft', meta: { frontmatter: { date: '2024-01-02', draft: true } } },
    ],
  }),
}))
afterEach(() => {
  vi.unstubAllEnvs()
  config.value.publishing.drafts = false
})

it('reactively honors publishing.drafts in pages and posts in production', () => {
  vi.stubEnv('DEV', false)
  const pages = usePageList()
  const posts = usePostList()
  expect(pages.value.map(page => page.path)).toEqual(['/posts/public'])
  expect(posts.value.map(post => post.path)).toEqual(['/posts/public'])
  config.value.publishing.drafts = true
  expect(pages.value.map(page => page.path)).toEqual(['/posts/public', '/posts/draft'])
  expect(posts.value.map(post => post.path)).toEqual(['/posts/draft', '/posts/public'])
  config.value.publishing.drafts = false
  expect(pages.value).toHaveLength(1)
  expect(posts.value).toHaveLength(1)
})

it('keeps draft pages and posts visible in development', () => {
  vi.stubEnv('DEV', true)
  expect(usePageList().value).toHaveLength(2)
  expect(usePostList().value).toHaveLength(2)
})
