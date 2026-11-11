import type { RouteRecordRaw } from 'vue-router'
import { createPinia } from 'pinia'
import { expect, it, vi } from 'vitest'
import { createSSRApp, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { usePageList, usePostList, usePostListWithCollections } from '../../packages/valaxy/client/composables/post'
import { useRouterStore } from '../../packages/valaxy/client/stores/router'

vi.mock('valaxy', async () => ({
  ...await import('../../packages/valaxy/client/utils/time'),
  useSiteConfig: () => ref({ orderBy: 'date' }),
}))
vi.mock('#valaxy/blog/collections', () => ({ default: [] }))
vi.mock('../../packages/valaxy/client/utils', () => ({
  isLocaleKey: () => false,
  stripLocalePrefix: (value: string) => value,
  tObject: (value: unknown) => value,
}))
vi.mock('../../packages/valaxy/client/stores', async () => import('../../packages/valaxy/client/stores/router'))

function post(frontmatter: Record<string, unknown>, excerpt: string): RouteRecordRaw {
  return {
    path: '/posts/%E4%B8%AD%E6%96%87',
    name: 'custom-post-name',
    alias: '/short',
    component: {},
    meta: { excerpt, frontmatter: { date: '2026-11-11', ...frontmatter } },
  }
}

function createSite() {
  const app = createSSRApp({})
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [post({ title: 'Before', tags: ['old'], categories: ['old-category'] }, '<p>Before</p>')],
  })
  app.use(createPinia())
  app.use(router)
  return app.runWithContext(() => ({
    router,
    store: useRouterStore(),
    lists: [usePageList(), usePostList(), usePostListWithCollections()],
  }))
}

it('refreshes all cached lists with final route metadata without navigating to the edited post', () => {
  const site = createSite()
  const otherSite = createSite()
  try {
    expect(site.store.$state).not.toHaveProperty('routes')
    expect(JSON.stringify(site.store.$state)).toBe('{}')
    for (const list of site.lists)
      expect(list.value).toHaveLength(1) // aliases must not duplicate posts

    // Match the generated-route HMR callback: replace all routes, then publish.
    site.router.clearRoutes()
    site.router.addRoute(post({ title: 'After' }, '<p>After</p>'))
    site.store.refreshRoutes()

    for (const list of site.lists) {
      expect(list.value).toMatchObject([{ title: 'After', excerpt: '<p>After</p>' }])
      expect(list.value[0]).not.toHaveProperty('tags')
      expect(list.value[0]).not.toHaveProperty('categories')
    }
    expect(otherSite.lists[0].value[0].title).toBe('Before')

    site.router.clearRoutes()
    site.store.refreshRoutes()
    for (const list of site.lists)
      expect(list.value).toEqual([])

    site.router.addRoute(post({ title: 'Recreated' }, ''))
    site.store.refreshRoutes()
    for (const list of site.lists)
      expect(list.value).toMatchObject([{ title: 'Recreated', excerpt: '' }])
  }
  finally {
    site.store.$dispose()
    otherSite.store.$dispose()
  }
})
