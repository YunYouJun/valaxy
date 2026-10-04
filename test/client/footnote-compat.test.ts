// @vitest-environment jsdom
import FloatingVue from 'floating-vue'
import { expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import ValaxyFootnoteTooltip from '../../packages/valaxy/client/components/ValaxyFootnoteTooltip.vue'

vi.mock('../../packages/valaxy/client/config', async () => {
  const { computed } = await import('vue')
  return { useSiteConfig: () => computed(() => ({ footnote: { preview: 'floating-vue' } })) }
})

it('keeps the legacy slots, custom options and client-only hydration fallback', async () => {
  function createApp() {
    return createSSRApp({
      render: () => h(ValaxyFootnoteTooltip, {}, {
        default: () => h('a', { href: '#fn1' }, '[1]'),
        popper: () => h('p', 'Legacy footnote content'),
      }),
    }).use(FloatingVue, { themes: { tooltip: { placement: 'bottom', delay: 0 } } })
  }
  const html = await renderToString(createApp())
  expect(html).toContain('href="#fn1"')
  expect(html).not.toContain('v-popper')
  expect(html).not.toContain('va-footnote-preview')
  document.body.innerHTML = `<div id="app">${html}</div>`
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const app = createApp()
  try {
    app.mount('#app')
    await nextTick()
    document.querySelector('a')!.dispatchEvent(new Event('mouseenter'))
    await vi.waitFor(() => {
      expect(document.querySelector('.v-popper__popper')?.textContent).toContain('Legacy footnote content')
      expect(document.querySelector('.v-popper__popper')?.getAttribute('data-popper-placement')).toBe('bottom')
    })
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  }
  finally {
    app.unmount()
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  }
})
