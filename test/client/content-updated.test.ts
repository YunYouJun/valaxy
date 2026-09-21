// @vitest-environment jsdom
import { renderToString } from '@vue/server-renderer'
import { afterEach, expect, it, vi } from 'vitest'
import { createApp, createSSRApp, h, onMounted } from 'vue'
import { contentUpdatedCallbacks, onContentUpdated, runContentUpdated } from '../../packages/valaxy/client/utils/content'

const baseline = contentUpdatedCallbacks.length
afterEach(() => {
  vi.unstubAllEnvs()
  expect(contentUpdatedCallbacks).toHaveLength(baseline)
})

it('does not retain content callbacks or page state after SSR', async () => {
  vi.stubEnv('SSR', true)
  const callback = vi.fn()
  for (let page = 0; page < 25; page++) {
    const app = createSSRApp({
      setup() {
        onContentUpdated(() => callback(page))
        return () => h('article', `Page ${page}`)
      },
    })
    expect(await renderToString(app)).toBe(`<article>Page ${page}</article>`)
  }
  runContentUpdated()
  expect(callback).not.toHaveBeenCalled()
})

it('runs browser callbacks and removes them on unmount', () => {
  vi.stubEnv('SSR', false)
  const callback = vi.fn()
  const app = createApp({
    setup() {
      onContentUpdated(callback)
      return () => h('article')
    },
  })
  app.mount(document.createElement('div'))
  try {
    runContentUpdated()
    expect(callback).toHaveBeenCalledOnce()
  }
  finally {
    app.unmount()
  }
  runContentUpdated()
  expect(callback).toHaveBeenCalledOnce()
})

it('registers during setup before child content announces its first update', () => {
  vi.stubEnv('SSR', false)
  const callback = vi.fn()
  const content = {
    setup() {
      onMounted(runContentUpdated)
      return () => h('article')
    },
  }
  const app = createApp({
    setup() {
      onContentUpdated(callback)
      return () => h(content)
    },
  })
  app.mount(document.createElement('div'))
  try {
    expect(callback).toHaveBeenCalledOnce()
  }
  finally {
    app.unmount()
  }
})
