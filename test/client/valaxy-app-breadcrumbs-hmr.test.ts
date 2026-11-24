import type { RouteRecordRaw } from 'vue-router'
import { createHead } from '@unhead/vue/server'
import { createPinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, ref } from 'vue'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'
import { renderToString } from 'vue/server-renderer'

const siteConfig = ref({
  url: 'https://example.com/',
  title: 'Example Site',
  description: 'Site description',
  lang: 'en',
  languages: ['en'],
  author: { name: 'Author', avatar: '/avatar.png' },
  social: [],
  seo: {},
})

vi.mock('../../packages/valaxy/client/config', () => ({
  dataSymbol: Symbol('valaxy-data'),
  useSiteConfig: () => siteConfig,
}))
vi.mock('../../packages/valaxy/client/composables', async () => {
  const { useFrontmatter } = await import('../../packages/valaxy/client/composables/common')
  return {
    useFrontmatter,
    useLocale: () => ({ toggleLocale: () => {} }),
    useValaxyHead: () => {},
    useValaxyI18n: () => ({
      $t: (value: unknown) => (typeof value === 'string' ? value : ''),
      $tO: (value: unknown) => (typeof value === 'string' ? value : ''),
    }),
  }
})
vi.mock('../../packages/valaxy/client/composables/locale', () => ({
  useValaxyI18n: () => ({
    $t: (value: unknown) => (typeof value === 'string' ? value : ''),
    $tO: (value: unknown) => (typeof value === 'string' ? value : ''),
  }),
}))
vi.mock('../../packages/valaxy/client/composables/global', () => ({
  useTimezone: () => {},
}))
vi.mock('../../packages/valaxy/client/utils/layouts', () => ({
  useLayout: () => ref('post'),
}))

const { useValaxyApp } = await import('../../packages/valaxy/client/composables/app/useValaxyApp')
const { useRouterStore } = await import('../../packages/valaxy/client/stores/router')

function pageRoute(path: string, title: string): RouteRecordRaw {
  return {
    path,
    component: {},
    meta: { frontmatter: { title } },
  }
}

function readBreadcrumbs(head: ReturnType<typeof createHead>) {
  const { bodyTags } = head.render()
  const json = bodyTags.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1]
  const graph = JSON.parse(json!)['@graph'] as Record<string, any>[]
  const breadcrumb = graph.find(node => [node['@type']].flat().includes('BreadcrumbList'))
  return (breadcrumb?.itemListElement || []).map((entry: Record<string, any>) => ({
    name: entry.name,
    item: entry.item,
  }))
}

describe('useValaxyApp breadcrumbs HMR reactivity', () => {
  it('updates schema breadcrumbs when ancestor routes are added or removed via HMR', async () => {
    let routerStore!: ReturnType<typeof useRouterStore>
    const App = defineComponent({
      setup() {
        routerStore = useRouterStore()
        useValaxyApp()
        return () => h('div')
      },
    })
    const app = createSSRApp(App)
    const head = createHead()
    head.push({ templateParams: { schemaOrg: { host: 'https://example.com/' } } })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        pageRoute('/', 'Home'),
        pageRoute('/guide/', 'Guide'),
        pageRoute('/guide/custom/styles', 'Styles'),
      ],
    })
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: { en: {} },
    })

    app.use(createPinia())
    app.use(router)
    app.use(head)
    app.use(i18n)

    await router.push('/guide/custom/styles')
    await router.isReady()
    await renderToString(app)

    try {
      expect(readBreadcrumbs(head)).toEqual([
        { name: 'Example Site', item: 'https://example.com/' },
        { name: 'Guide', item: 'https://example.com/guide/' },
        { name: 'Styles', item: 'https://example.com/guide/custom/styles' },
      ])

      // Simulate HMR adding a previously missing intermediate ancestor route.
      router.clearRoutes()
      for (const route of [
        pageRoute('/', 'Home'),
        pageRoute('/guide/', 'Guide'),
        pageRoute('/guide/custom/', 'Custom'),
        pageRoute('/guide/custom/styles', 'Styles'),
      ]) {
        router.addRoute(route)
      }
      routerStore.refreshRoutes()

      expect(readBreadcrumbs(head)).toEqual([
        { name: 'Example Site', item: 'https://example.com/' },
        { name: 'Guide', item: 'https://example.com/guide/' },
        { name: 'Custom', item: 'https://example.com/guide/custom/' },
        { name: 'Styles', item: 'https://example.com/guide/custom/styles' },
      ])

      // Simulate HMR removing an existing ancestor route.
      router.clearRoutes()
      for (const route of [
        pageRoute('/', 'Home'),
        pageRoute('/guide/custom/', 'Custom'),
        pageRoute('/guide/custom/styles', 'Styles'),
      ]) {
        router.addRoute(route)
      }
      routerStore.refreshRoutes()

      expect(readBreadcrumbs(head)).toEqual([
        { name: 'Example Site', item: 'https://example.com/' },
        { name: 'Custom', item: 'https://example.com/guide/custom/' },
        { name: 'Styles', item: 'https://example.com/guide/custom/styles' },
      ])
    }
    finally {
      routerStore.$dispose()
    }
  })

  it('excludes layout wrapper routes, preserves frontmatter titles over empty trailing-slash routes, and ignores protocol-relative canonicals', async () => {
    let routerStore!: ReturnType<typeof useRouterStore>
    const App = defineComponent({
      setup() {
        routerStore = useRouterStore()
        useValaxyApp()
        return () => h('div')
      },
    })
    const app = createSSRApp(App)
    const head = createHead()
    head.push({ templateParams: { schemaOrg: { host: 'https://example.com/' } } })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        pageRoute('/', 'Home'),
        {
          path: '/old',
          component: {},
          meta: { isLayout: true },
          children: [{ path: '', redirect: '/new' }],
        },
        {
          path: '/old/child',
          component: {},
          meta: { frontmatter: { title: 'Child' } },
        },
        {
          path: '/404',
          component: {},
          meta: { isLayout: true },
          children: [{ path: '', component: {}, meta: { layout: '404', frontmatter: { title: 'Not Found' } } }],
        },
        {
          path: '/404/sub',
          component: {},
          meta: { frontmatter: { title: 'Sub' } },
        },
        {
          path: '/guide',
          component: {},
          meta: { frontmatter: { title: 'Guide Title' } },
        },
        {
          path: '/guide/',
          component: {},
        },
        {
          path: '/guide/page',
          component: {},
          meta: { frontmatter: { title: 'Guide Page', canonical: '//other.example/hijack' } },
        },
      ],
    })
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: { en: {} },
    })

    app.use(createPinia())
    app.use(router)
    app.use(head)
    app.use(i18n)

    await router.push('/old/child')
    await router.isReady()
    await renderToString(app)

    try {
      expect(readBreadcrumbs(head)).toEqual([
        { name: 'Example Site', item: 'https://example.com/' },
        { name: 'Child', item: 'https://example.com/old/child' },
      ])

      await router.push('/404/sub')
      expect(readBreadcrumbs(head)).toEqual([
        { name: 'Example Site', item: 'https://example.com/' },
        { name: 'Sub', item: 'https://example.com/404/sub' },
      ])

      await router.push('/guide/page')
      expect(readBreadcrumbs(head)).toEqual([
        { name: 'Example Site', item: 'https://example.com/' },
        { name: 'Guide Title', item: 'https://example.com/guide' },
        { name: 'Guide Page', item: 'https://example.com/guide/page' },
      ])
    }
    finally {
      routerStore.$dispose()
    }
  })
})
