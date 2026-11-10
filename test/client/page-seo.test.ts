import { describe, expect, it, vi } from 'vitest'
import { reactive, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory('/blog/'),
  routes: [
    { path: '/', component: {} },
    { path: '/posts/:slug', component: {} },
    { path: '/guide/', component: {} },
    { path: '/nested', component: {}, children: [{ path: 'directory/', component: {} }] },
  ],
})
const route = reactive({ ...router.currentRoute.value })
const frontmatter = ref<Record<string, string>>({})
const siteConfig = ref({ url: 'https://example.com/blog/', description: 'Site description' })

vi.mock('vue-router', async importOriginal => ({
  ...await importOriginal<typeof import('vue-router')>(),
  useRoute: () => route,
}))
vi.mock('../../packages/valaxy/client/config', () => ({ useSiteConfig: () => siteConfig }))
vi.mock('../../packages/valaxy/client/composables/common', () => ({ useFrontmatter: () => frontmatter }))
vi.mock('../../packages/valaxy/client/composables/locale', () => ({
  useValaxyI18n: () => ({ $t: (value: unknown) => value, $tO: (value: unknown) => value }),
}))

const { usePageSeo } = await import('../../packages/valaxy/client/composables/app/usePageSeo')

describe('page SEO route URLs', () => {
  it.each([
    ['/', '/'],
    ['/posts/hello/', '/posts/hello'],
    ['/posts/%E4%B8%AD%E6%96%87/?q=1#heading', '/posts/%E4%B8%AD%E6%96%87'],
    ['/guide', '/guide/'],
    ['/guide/', '/guide/'],
    ['/nested/directory', '/nested/directory/'],
  ])('uses the matched route slash convention for %s', (path, canonical) => {
    Object.assign(route, router.resolve(path))
    frontmatter.value = {}
    const { pageUrl } = usePageSeo()
    expect(pageUrl.value).toBe(`https://example.com/blog${canonical}`)
  })

  it('keeps canonical and relative share images stable across navigation to an alias', () => {
    frontmatter.value = { cover: './cover.png' }
    Object.assign(route, router.resolve('/posts/hello'))
    const { pageUrl, image } = usePageSeo()
    expect(pageUrl.value).toBe('https://example.com/blog/posts/hello')
    expect(image.value).toBe('https://example.com/blog/posts/cover.png')

    Object.assign(route, router.resolve('/posts/hello/'))
    expect(pageUrl.value).toBe('https://example.com/blog/posts/hello')
    expect(image.value).toBe('https://example.com/blog/posts/cover.png')
  })

  it('preserves explicit canonical URLs without changing the image directory', () => {
    Object.assign(route, router.resolve('/posts/hello/'))
    frontmatter.value = { canonical: 'https://original.example/article/', cover: './cover.png' }
    const { pageUrl, image } = usePageSeo()
    expect(pageUrl.value).toBe('https://original.example/article/')
    expect(image.value).toBe('https://example.com/blog/posts/cover.png')
  })
})
