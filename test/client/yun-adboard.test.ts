// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
// Namespace imports: the whole `vue` / `vue/server-renderer` modules are handed to
// the compiled render functions (see `compileSfc`), so we call members off them too.
import * as Vue from 'vue'
import { compileTemplate, parse } from 'vue/compiler-sfc'
import * as serverRenderer from 'vue/server-renderer'
import YunAdBoardCard from '../../packages/valaxy-theme-yun/components/YunAdBoardCard.vue'

const componentPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../packages/valaxy-theme-yun/components/YunAdBoard.vue',
)

/**
 * Compile an SFC `<template>` source into a render / ssrRender pair without
 * needing the Vue Vite plugin, so we can assert on the real component output.
 */
function compileSfc(source: string) {
  const { descriptor } = parse(source, { filename: 'YunAdBoard.vue' })
  const template = descriptor.template?.content ?? ''
  const shared = { filename: 'YunAdBoard.vue', id: 'data-v-test', compilerOptions: { mode: 'function' as const, comments: false } }

  // eslint-disable-next-line no-new-func
  const render = new Function('Vue', compileTemplate({ ...shared, source: template, ssr: false }).code)(Vue)
  // eslint-disable-next-line no-new-func
  const ssrRender = new Function('Vue', 'require', compileTemplate({ ...shared, source: template, ssr: true }).code)(
    Vue,
    (id: string) => (id === 'vue/server-renderer' ? serverRenderer : Vue),
  )

  return { render, ssrRender }
}

describe('valaxy-theme-yun YunAdBoard (#711)', () => {
  it('renders an empty placeholder without a raw <template> element', async () => {
    const component = compileSfc(readFileSync(componentPath, 'utf-8'))
    const html = await serverRenderer.renderToString(Vue.createSSRApp(component))

    // A serialized `<template>` element in the SSR output is exactly what breaks
    // hydration (`Failed to execute 'replaceChild' on 'Node'`) in #711.
    expect(html).not.toContain('<template')
    // The default ad board is an overridable placeholder: it renders nothing visible.
    expect(html.replace(/<!--[\s\S]*?-->/g, '').trim()).toBe('')
  })

  it('hydrates the SSR output without a mismatch', async () => {
    const component = compileSfc(readFileSync(componentPath, 'utf-8'))
    const html = await serverRenderer.renderToString(Vue.createSSRApp(component))

    const container = document.createElement('div')
    container.innerHTML = html

    const logs: string[] = []
    const errorSpy = vi.spyOn(console, 'error').mockImplementation((...args) => logs.push(args.join(' ')))
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation((...args) => logs.push(args.join(' ')))

    // `finally` guarantees the console spies are restored even when an assertion
    // throws (e.g. on a regression), so the mocks never leak into later tests.
    try {
      expect(() => Vue.createSSRApp(component).mount(container)).not.toThrow()
      expect(logs.filter(log => log.includes('Hydration'))).toEqual([])
    }
    finally {
      errorSpy.mockRestore()
      warnSpy.mockRestore()
    }
  })

  it('regression guard: a raw <template /> placeholder serializes as a <template> element', async () => {
    // Documents the broken form replaced in #711 — keep YunAdBoard from regressing to it.
    const broken = compileSfc('<template>\n  <template />\n</template>')
    const html = await serverRenderer.renderToString(Vue.createSSRApp(broken))
    expect(html).toContain('<template>')
  })
})

const AppLinkStub = Vue.defineComponent({
  name: 'AppLink',
  props: {
    to: String,
    href: String,
    target: String,
    showExternalIcon: Boolean,
  },
  setup(props, { slots }) {
    return () => Vue.h(
      'a',
      {
        href: props.href || props.to || '#',
        target: props.target,
      },
      slots.default?.(),
    )
  },
})

const YunGradientDividerStub = Vue.defineComponent({
  name: 'YunGradientDivider',
  setup() {
    return () => Vue.h('div', { class: 'yun-gradient-line' })
  },
})

async function renderAdBoardCard(
  props: Record<string, unknown>,
  slots: Record<string, () => Vue.VNodeChild> = {},
) {
  const app = Vue.createSSRApp({
    render: () => Vue.h(YunAdBoardCard, props, slots),
  })
  app.component('AppLink', AppLinkStub)
  app.component('YunGradientDivider', YunGradientDividerStub)
  return await serverRenderer.renderToString(app)
}

describe('valaxy-theme-yun YunAdBoardCard', () => {
  it('renders unified card structure with internal link, default icon, divider, and body', async () => {
    const html = await renderAdBoardCard(
      {
        title: '如何使用广告板？',
        to: '/posts/how-to-use-adboard',
      },
      {
        default: () => [
          Vue.h('p', '欢迎加入 Valaxy 社区交流群'),
          Vue.h('p', ['QQ 群 ', Vue.h('code', '1050458482')]),
        ],
      },
    )

    const container = document.createElement('div')
    container.innerHTML = html

    const card = container.querySelector('.yun-ad-board-card')
    expect(card?.classList.contains('is-align-center')).toBe(true)

    const link = container.querySelector('.yun-ad-board-title-link') as HTMLAnchorElement | null
    expect(link).not.toBeNull()
    expect(link?.getAttribute('href')).toBe('/posts/how-to-use-adboard')
    expect(link?.getAttribute('rel')).toBeNull()
    expect(link?.querySelector('.yun-ad-board-icon')?.classList.contains('i-ri-megaphone-line')).toBe(true)
    expect(link?.querySelector('.yun-ad-board-arrow')?.classList.contains('i-ri-arrow-right-s-line')).toBe(true)
    expect(container.querySelector('.yun-ad-board-divider')).not.toBeNull()
    expect(container.querySelector('.yun-ad-board-body code')?.textContent).toBe('1050458482')
  })

  it('renders external link attributes and optional badge', async () => {
    const html = await renderAdBoardCard(
      {
        title: 'Sponsor',
        href: 'https://example.com',
        badge: 'AD',
      },
      {
        default: () => Vue.h('p', 'Support Valaxy'),
      },
    )

    const container = document.createElement('div')
    container.innerHTML = html

    const link = container.querySelector('.yun-ad-board-title-link')
    expect(link?.classList.contains('is-external')).toBe(true)
    expect(link?.getAttribute('href')).toBe('https://example.com')
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(link?.querySelector('.yun-ad-board-arrow')?.classList.contains('i-ri-arrow-right-up-line')).toBe(true)
    expect(container.querySelector('.yun-ad-board-badge')?.textContent?.trim()).toBe('AD')
  })

  it('supports hiding the icon, start alignment, and flush mode', async () => {
    const html = await renderAdBoardCard(
      {
        title: 'Banner',
        icon: false,
        align: 'start',
        flush: true,
      },
      {
        default: () => Vue.h('img', { src: '/banner.png', alt: 'Banner' }),
      },
    )

    const container = document.createElement('div')
    container.innerHTML = html

    const card = container.querySelector('.yun-ad-board-card')
    expect(card?.classList.contains('is-align-start')).toBe(true)
    expect(card?.classList.contains('is-flush')).toBe(true)
    expect(container.querySelector('.yun-ad-board-icon')).toBeNull()
    expect(container.querySelector('.yun-ad-board-divider')).toBeNull()
    expect(container.querySelector('.yun-ad-board-body img')).not.toBeNull()
  })

  it('omits header and divider when rendering body-only content', async () => {
    const html = await renderAdBoardCard(
      {},
      {
        default: () => Vue.h('p', 'Custom ad content'),
      },
    )

    const container = document.createElement('div')
    container.innerHTML = html

    expect(container.querySelector('.yun-ad-board-header')).toBeNull()
    expect(container.querySelector('.yun-ad-board-divider')).toBeNull()
    expect(container.querySelector('.yun-ad-board-body')?.textContent).toContain('Custom ad content')
  })
})
