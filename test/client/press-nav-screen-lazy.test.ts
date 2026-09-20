// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { createApp, createSSRApp, h, nextTick, shallowRef } from 'vue'
import { renderToString } from 'vue/server-renderer'
import PressNavScreen from '../../packages/valaxy-theme-press/components/PressNavScreen.vue'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))

it('renders mobile navigation only after opening and recreates it after closing', async () => {
  const setupMenu = vi.fn(() => () => h('a', { href: '/api/' }, 'API'))
  const register = (app: ReturnType<typeof createApp>) => {
    for (const name of ['PressNavScreenMenu', 'PressNavScreenTranslations', 'PressNavScreenAppearance', 'PressNavScreenSocialLinks'])
      app.component(name, { setup: setupMenu })
    return app
  }
  const html = await renderToString(register(createSSRApp(PressNavScreen, { open: false })))
  expect(html).not.toContain('href="/api/"')
  expect(setupMenu).not.toHaveBeenCalled()
  const open = shallowRef(false)
  const el = document.createElement('div')
  const app = register(createApp({ setup: () => () => h(PressNavScreen, { open: open.value }) }))
  app.mount(el)
  try {
    for (let i = 0; i < 2; i++) {
      open.value = true
      await nextTick()
      expect(el.querySelectorAll('a')).toHaveLength(4)
      open.value = false
      await nextTick()
      expect(el.querySelectorAll('a')).toHaveLength(0)
    }
  }
  finally { app.unmount() }
})
