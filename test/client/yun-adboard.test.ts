// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import * as Vue from 'vue'
import { createSSRApp } from 'vue'
import { compileTemplate, parse } from 'vue/compiler-sfc'
import * as serverRenderer from 'vue/server-renderer'
import { renderToString } from 'vue/server-renderer'

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
    const html = await renderToString(createSSRApp(component))

    // A serialized `<template>` element in the SSR output is exactly what breaks
    // hydration (`Failed to execute 'replaceChild' on 'Node'`) in #711.
    expect(html).not.toContain('<template')
    // The default ad board is an overridable placeholder: it renders nothing visible.
    expect(html.replace(/<!--[\s\S]*?-->/g, '').trim()).toBe('')
  })

  it('hydrates the SSR output without a mismatch', async () => {
    const component = compileSfc(readFileSync(componentPath, 'utf-8'))
    const html = await renderToString(createSSRApp(component))

    const container = document.createElement('div')
    container.innerHTML = html

    const logs: string[] = []
    const errorSpy = vi.spyOn(console, 'error').mockImplementation((...args) => logs.push(args.join(' ')))
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation((...args) => logs.push(args.join(' ')))

    // `finally` guarantees the console spies are restored even when an assertion
    // throws (e.g. on a regression), so the mocks never leak into later tests.
    try {
      expect(() => createSSRApp(component).mount(container)).not.toThrow()
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
    const html = await renderToString(createSSRApp(broken))
    expect(html).toContain('<template>')
  })
})
