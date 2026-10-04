// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { renderToString } from 'vue/server-renderer'
import FootnotePopover from '../../packages/valaxy/client/components/footnote/FootnotePopover.vue'

it('hydrates multiple previews without replacing footnote anchors or duplicating IDs', async () => {
  function createApp() {
    return createSSRApp({
      render: () => [1, 2].map(id => h(FootnotePopover, {}, {
        default: () => h('sup', h('a', { href: `#fn${id}`, id: `fnref${id}` }, `[${id}]`)),
        popper: () => h('p', ['Footnote ', h('a', { href: 'https://valaxy.site' }, 'link')]),
      })),
    }).use(createI18n({ legacy: false, locale: 'en', messages: { en: { post: { footnote_preview: 'Preview footnote', footnote_close: 'Close preview' } } } }))
  }

  const html = await renderToString(createApp())
  document.body.innerHTML = `<div id="app">${html}</div><div id="valaxy-teleports"></div>`
  const anchors = [...document.querySelectorAll('a')]
  expect(anchors.map(a => a.getAttribute('href'))).toEqual(['#fn1', '#fn2'])
  expect(document.querySelectorAll('button[aria-label="Preview footnote"]')).toHaveLength(2)

  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const app = createApp()
  try {
    app.mount('#app')
    await nextTick()
    document.querySelectorAll('a').forEach((anchor, index) => expect(anchor).toBe(anchors[index]))
    const ids = [...document.querySelectorAll('[id]')].map(el => el.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(error).not.toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled()
  }
  finally {
    app.unmount()
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  }
})
