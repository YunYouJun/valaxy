// @vitest-environment jsdom
import type { Component } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createApp, createSSRApp, defineAsyncComponent, defineComponent, h, nextTick, shallowRef } from 'vue'
import { renderToString } from 'vue/server-renderer'
import HelloValaxyCover from '../../packages/create-valaxy/template-blog/components/covers/HelloValaxyCover.vue'
import ValaxyCover from '../../packages/valaxy/client/components/ValaxyCover.vue'

const { covers } = vi.hoisted(() => ({ covers: new Map<string, Component>() }))
vi.mock('virtual:valaxy-cover-components', () => ({ default: covers }))

beforeEach(() => {
  covers.clear()
  vi.stubEnv('BASE_URL', '/blog/')
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

const InteractiveCover = defineComponent({
  props: ['label', 'src', 'context'],
  setup(props) {
    const count = shallowRef(0)
    return () => h('button', { 'data-context': props.context, 'data-src': props.src, 'onClick': () => count.value++ }, `${props.label}: ${count.value}`)
  },
})

it('renders graphical covers without images and with unique, deterministic SVG definitions', async () => {
  covers.set('Hello', HelloValaxyCover)
  const page = () => createSSRApp({
    render: () => h('div', [
      h(ValaxyCover, { component: 'Hello' }),
      h(HelloValaxyCover),
    ]),
  })
  const html = await renderToString(page())
  expect(html.match(/<svg /g)).toHaveLength(2)
  expect(html).not.toContain('<img')
  const ids = [...html.matchAll(/id="([^"]+)"/g)].map(match => match[1])
  expect(ids).toHaveLength(4)
  expect(new Set(ids).size).toBe(4)
  expect(await renderToString(page())).toBe(html)
})

it('keeps an image fallback and deployment base when a component is missing', async () => {
  const html = await renderToString(createSSRApp(ValaxyCover, { src: '/sky.png', component: 'Missing', alt: 'Sky' }))
  expect(html).toContain('src="/blog/sky.png"')
  expect(html).toContain('alt="Sky"')
  expect(html).not.toContain('valaxy-cover-content')
  expect(html).not.toContain('<Missing')
})

it('server renders lazy components and hydrates their props and interaction', async () => {
  const props = { src: '/sky.png', component: 'Sky', componentProps: { label: 'Light', context: 'overridden' }, context: 'card' as const }
  covers.set('Sky', defineAsyncComponent(async () => InteractiveCover))
  const html = await renderToString(createSSRApp(ValaxyCover, props))
  expect(html).toContain('Light: 0')
  expect(html).toContain('data-context="card"')
  expect(html).toContain('data-src="/sky.png"')
  // A fresh client registry starts with an unresolved async component.
  covers.set('Sky', defineAsyncComponent(async () => InteractiveCover))
  const container = document.createElement('div')
  container.innerHTML = html
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
  const warnings = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const app = createSSRApp(ValaxyCover, props)
  app.mount(container)
  try {
    await vi.waitFor(async () => {
      container.querySelector('button')!.click()
      await nextTick()
      expect(container.querySelector('button')!.textContent).not.toBe('Light: 0')
    })
    expect(errors).not.toHaveBeenCalled()
    expect(warnings).not.toHaveBeenCalled()
  }
  finally {
    app.unmount()
  }
})

it('retains the image on import failure and recovers when navigating to another cover', async () => {
  covers.set('Broken', defineAsyncComponent(async () => {
    throw new Error('offline')
  }))
  covers.set('Working', InteractiveCover)
  const name = shallowRef('Broken')
  const container = document.createElement('div')
  const app = createApp({ render: () => h(ValaxyCover, { src: '/sky.png', component: name.value, componentProps: { label: 'Works' } }) })
  app.mount(container)
  try {
    await vi.waitFor(() => expect(container.querySelector('.valaxy-cover-content')).toBeNull())
    expect(container.querySelector('img')!.getAttribute('src')).toBe('/blog/sky.png')
    name.value = 'Working'
    await nextTick()
    expect(container.querySelector('button')!.textContent).toBe('Works: 0')
  }
  finally {
    app.unmount()
  }
})
