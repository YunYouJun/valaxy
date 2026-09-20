// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { createApp, createSSRApp, defineComponent, h, nextTick, reactive, shallowRef } from 'vue'
import { renderToString } from 'vue/server-renderer'
import PressSidebarItem from '../../packages/valaxy-theme-press/components/PressSidebarItem.vue'

const route = reactive({ path: '/api/current' })
vi.mock('vue-router', () => ({ useRoute: () => route }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
const AppLink = defineComponent({ setup: (_, { attrs, slots }) => () => h('a', attrs, slots.default?.()) })
const unrelated = { text: 'Other module', collapsed: true, items: [{ text: 'Other symbol', link: '/api/other' }] }

afterEach(() => {
  route.path = '/api/current'
})

it('omits collapsed subtree components from SSR while rendering the active branch', async () => {
  const item = {
    text: 'API',
    collapsed: true,
    items: [
      { text: 'Current module', collapsed: true, items: [{ text: 'Current symbol', link: '/api/current' }] },
      unrelated,
    ],
  }
  const app = createSSRApp(PressSidebarItem, { item, depth: 0 })
  app.component('AppLink', AppLink)
  const html = await renderToString(app)
  expect(html).toContain('href="/api/current"')
  expect(html).toContain('Other module')
  expect(html).not.toContain('href="/api/other"')
  expect(html).toContain('aria-expanded="true"')
})

it('opens on interaction and navigation without mounting closed children', async () => {
  const container = document.createElement('div')
  const app = createApp(PressSidebarItem, { item: unrelated, depth: 0 })
  app.component('AppLink', AppLink)
  app.mount(container)
  try {
    expect(container.querySelector('a')).toBeNull()
    container.querySelector('button')!.click()
    await nextTick()
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/api/other')
    container.querySelector('button')!.click()
    await nextTick()
    expect(container.querySelector('a')).toBeNull()
    route.path = '/api/other'
    await nextTick()
    expect(container.querySelector('a')).not.toBeNull()
  }
  finally {
    app.unmount()
  }
})

it('keeps the active branch open when navigation rebuilds sidebar item objects', async () => {
  const item = shallowRef({ text: 'API', collapsed: true, items: [{ text: 'Current', link: '/api/current' }] })
  const container = document.createElement('div')
  const app = createApp({ setup: () => () => h(PressSidebarItem, { item: item.value, depth: 0 }) })
  app.component('AppLink', AppLink)
  app.mount(container)
  try {
    expect(container.querySelector('a')).not.toBeNull()
    item.value = { ...item.value }
    await nextTick()
    expect(container.querySelector('a')).not.toBeNull()
  }
  finally { app.unmount() }
})
