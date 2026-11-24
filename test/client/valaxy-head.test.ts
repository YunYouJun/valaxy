import { definePerson, defineWebPage, defineWebSite, useSchemaOrg } from '@unhead/schema-org/vue'
import { createHead } from '@unhead/vue/server'
import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, reactive, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { renderToString } from 'vue/server-renderer'

const router = createRouter({
  history: createMemoryHistory('/blog/'),
  routes: [
    { path: '/', component: {} },
    { path: '/posts/:slug', component: {} },
    { path: '/archives/', component: {} },
    { path: '/404', component: {} },
  ],
})
const route = reactive({ ...router.currentRoute.value })
const frontmatter = ref<Record<string, unknown>>({})
const layout = ref<string | false>('post')
const locale = ref('en')
const siteConfig = ref({
  url: 'https://example.com/blog/',
  title: 'Example Site',
  lang: 'en',
  favicon: '/favicon.svg',
  description: 'Site description',
})
const runtimeConfig = ref<{ feed?: { rss: string, atom: string, json: string } }>({
  feed: { rss: 'feed.xml', atom: 'atom.xml', json: 'feed.json' },
})

vi.mock('vue-router', async importOriginal => ({
  ...await importOriginal<typeof import('vue-router')>(),
  useRoute: () => route,
}))
vi.mock('../../packages/valaxy/client/config', () => ({
  useSiteConfig: () => siteConfig,
  useRuntimeConfig: () => runtimeConfig,
}))
vi.mock('../../packages/valaxy/client/composables', () => ({
  useFrontmatter: () => frontmatter,
  useValaxyI18n: () => ({
    $t: (value: unknown) => value,
    $tO: (value: unknown) => value,
    locale,
  }),
}))
vi.mock('../../packages/valaxy/client/composables/common', () => ({
  useFrontmatter: () => frontmatter,
}))
vi.mock('../../packages/valaxy/client/composables/locale', () => ({
  useValaxyI18n: () => ({
    $t: (value: unknown) => value,
    $tO: (value: unknown) => value,
    locale,
  }),
}))
vi.mock('../../packages/valaxy/client/utils/layouts', () => ({
  useLayout: () => layout,
}))

const { useValaxyHead } = await import('../../packages/valaxy/client/composables/app/useValaxyHead')

async function renderHead(options?: { withSchema?: boolean }) {
  const head = createHead()
  const App = defineComponent({
    setup() {
      useValaxyHead()
      if (options?.withSchema) {
        useSchemaOrg([
          definePerson({ '@id': 'https://example.com/blog/#identity', 'name': 'Author' }),
          defineWebSite({ '@id': 'https://example.com/blog/#website', 'name': 'Example Site' }),
          defineWebPage({ name: 'Current Page' }),
        ])
      }
      return () => h('div')
    },
  })
  const app = createSSRApp(App)
  app.use(head)
  await renderToString(app)
  return head.render()
}

describe('useValaxyHead', () => {
  it('omits feed alternate links when siteConfig.url has no origin', async () => {
    Object.assign(route, router.resolve('/posts/hello'))
    frontmatter.value = { title: 'Hello' }
    layout.value = 'post'
    runtimeConfig.value = { feed: { rss: 'feed.xml', atom: 'atom.xml', json: 'feed.json' } }

    siteConfig.value = { ...siteConfig.value, url: '/' }
    const withoutOrigin = await renderHead()
    expect(withoutOrigin.headTags).not.toContain('application/rss+xml')
    expect(withoutOrigin.headTags).not.toContain('application/atom+xml')

    siteConfig.value = { ...siteConfig.value, url: '' }
    const emptyUrl = await renderHead()
    expect(emptyUrl.headTags).not.toContain('application/rss+xml')

    siteConfig.value = { ...siteConfig.value, url: 'https://example.com/blog/' }
    const withOrigin = await renderHead()
    expect(withOrigin.headTags).toContain('href="https://example.com/blog/feed.xml"')
    expect(withOrigin.headTags).toContain('href="https://example.com/blog/atom.xml"')
  })

  it('populates schemaOrg host, normalized path, and inLanguage from page context', async () => {
    siteConfig.value = { ...siteConfig.value, url: 'https://example.com/blog/', lang: 'en' }
    locale.value = 'zh-CN'
    layout.value = 'archives'
    Object.assign(route, router.resolve('/archives/'))
    frontmatter.value = { title: 'Archives', canonical: '/archives/#section' }

    const { bodyTags } = await renderHead({ withSchema: true })
    const json = bodyTags.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1]
    const graph = JSON.parse(json!)['@graph'] as Record<string, any>[]
    const website = graph.find(node => [node['@type']].flat().includes('WebSite'))
    const webpage = graph.find(node => [node['@type']].flat().includes('WebPage'))
    expect(website?.inLanguage).toBe('zh-CN')
    expect(webpage?.['@id']).toBe('https://example.com/blog/archives/#webpage')
    expect(webpage?.url).toBe('https://example.com/blog/archives/')

    // External or protocol-relative canonicals fall back to routePath for schemaOrg.path.
    for (const canonical of ['https://elsewhere.example/post', '//elsewhere.example/post']) {
      Object.assign(route, router.resolve('/posts/hello'))
      frontmatter.value = { title: 'Hello', canonical }
      const res = await renderHead({ withSchema: true })
      const nextJson = res.bodyTags.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1]
      const nextGraph = JSON.parse(nextJson!)['@graph'] as Record<string, any>[]
      const nextPage = nextGraph.find(node => [node['@type']].flat().includes('WebPage'))
      expect(nextPage?.['@id']).toBe('https://example.com/blog/posts/hello#webpage')
    }
  })
})
