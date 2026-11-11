// @vitest-environment jsdom
import type { Component } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import { renderToString } from 'vue/server-renderer'
import { createLayoutWrapper, createSetupLayouts, lazyLayout, setPageLayout } from '../../packages/valaxy/client/utils/layouts'

function layout(name: string) {
  return defineComponent({
    props: { label: String },
    setup: (props, { slots }) => () => h('main', { 'data-layout': name, 'aria-label': props.label }, slots.default?.()),
  })
}
const Counter = defineComponent({
  setup() {
    const count = ref(0)
    return () => h('button', { onClick: () => count.value++ }, `Count: ${count.value}`)
  },
})
const Post = layout('post')
const Other = layout('other')

function createContext(post: () => Promise<Component>, other: () => Promise<Component> = async () => Other) {
  const wrapper = createLayoutWrapper({ default: layout('default'), post: lazyLayout(post), other: lazyLayout(other) }, 'default', 'post')
  const setupLayouts = createSetupLayouts(wrapper, { inheritDefaultLayout: true })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: setupLayouts([
      { path: '/', component: Counter },
      { path: '/post', component: Counter, meta: { layout: { name: 'post', props: { label: 'Post layout' } } } },
      { path: '/other', component: Counter, meta: { layout: 'other' } },
      { path: '/guarded', component: Counter, meta: { layout: 'post' } },
      { path: '/bare', component: Counter, meta: { layout: false } },
    ]),
  })
  router.beforeEach((to) => {
    if (to.path === '/guarded')
      to.meta.layout = { name: 'other', props: { label: 'Guard-selected layout' } }
  })
  const app = createSSRApp({ render: () => h(RouterView) })
  app.use(router)
  return { app, router }
}

afterEach(() => {
  setPageLayout(null)
  vi.restoreAllMocks()
})

it('waits for the initial lazy layout and hydrates the existing SSR nodes', async () => {
  const server = createContext(async () => Post)
  await server.router.push('/post')
  const html = await renderToString(server.app)
  expect(html).toContain('data-layout="post"')
  expect(html).toContain('aria-label="Post layout"')
  const container = document.createElement('div')
  container.innerHTML = html
  const button = container.querySelector('button')!
  const warnings = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
  let release!: (component: Component) => void
  const loader = vi.fn(() => new Promise<Component>((resolve) => {
    release = resolve
  }))
  const client = createContext(loader)
  let ready = false
  const navigation = client.router.push('/post').then(() => {
    ready = true
  })
  await vi.waitFor(() => expect(loader).toHaveBeenCalledOnce())
  expect(ready).toBe(false)
  expect(container.querySelector('button')).toBe(button)
  release(Post)
  await navigation
  await client.router.isReady()
  client.app.mount(container)
  try {
    expect(container.querySelector('button')).toBe(button)
    button.click()
    await nextTick()
    expect(button.textContent).toBe('Count: 1')
    expect(warnings).not.toHaveBeenCalled()
    expect(errors).not.toHaveBeenCalled()
  }
  finally { client.app.unmount() }
})

it('preloads guard-selected layouts and caches them across navigation and history', async () => {
  const post = vi.fn(async () => Post)
  const other = vi.fn(async () => Other)
  const { app, router } = createContext(post, other)
  await router.push('/post')
  const container = document.createElement('div')
  container.innerHTML = await renderToString(app)
  app.mount(container)
  try {
    await router.push('/guarded')
    await nextTick()
    expect(container.querySelector('main')?.getAttribute('data-layout')).toBe('other')
    expect(container.querySelector('main')?.getAttribute('aria-label')).toBe('Guard-selected layout')
    await router.push('/bare')
    await nextTick()
    expect(container.querySelector('main')).toBeNull()
    expect(container.querySelector('button')).not.toBeNull()
    router.back()
    await vi.waitFor(() => expect(container.querySelector('main')?.getAttribute('data-layout')).toBe('other'))
    await router.push('/post')
    await nextTick()
    expect(container.querySelector('main')?.getAttribute('aria-label')).toBe('Post layout')
    expect(post).toHaveBeenCalledOnce()
    expect(other).toHaveBeenCalledOnce()
  }
  finally { app.unmount() }
})
