// @vitest-environment jsdom
import { renderToString } from '@vue/server-renderer'
import { afterEach, expect, it, vi } from 'vitest'
import { createApp, createSSRApp, h } from 'vue'
import { contentUpdatedCallbacks, onContentUpdated, runContentUpdated } from '../../packages/valaxy/client/utils/content'

const baseline = contentUpdatedCallbacks.length
afterEach(() => expect(contentUpdatedCallbacks).toHaveLength(baseline))

it('does not retain content callbacks or page state after SSR', async () => {
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

it('runs mounted browser callbacks and removes them on unmount', () => {
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
