// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest'
import { createApp, createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { createI18n } from 'vue-i18n'
import { renderToString } from 'vue/server-renderer'
import PressNavBar from '../../packages/valaxy-theme-press/components/PressNavBar.vue'
import { $t } from '../../packages/valaxy/node/utils/i18n'

const siteConfig = ref({ title: $t('siteConfig.title') })

vi.mock('valaxy', async () => {
  const { useValaxyI18n } = await import('../../packages/valaxy/client/composables/locale')
  return {
    useValaxyI18n,
    useSiteConfig: () => siteConfig,
    useSidebar: () => ({ hasSidebar: ref(false) }),
    withBase: (value: string) => value,
  }
})

vi.mock('../../packages/valaxy-theme-press/composables', () => ({
  useLocaleConfig: () => ({
    localeConfig: ref({}),
    currentLocale: ref({ link: '/' }),
    hasLocales: ref(false),
  }),
}))

vi.mock('reka-ui', () => ({
  NavigationMenuRoot: defineComponent({ setup: (_, { slots }) => () => h('div', slots.default?.()) }),
}))

function createNavApp(ssr: boolean, locale: string) {
  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    messages: {
      'en': { siteConfig: { title: 'English Version' } },
      'zh-CN': { siteConfig: { title: '中文版本' } },
    },
  })
  const app = (ssr ? createSSRApp : createApp)(PressNavBar)
  app.use(i18n)
  app.component('RouterLink', defineComponent({
    props: ['to'],
    setup: (props, { attrs, slots }) => () => h('a', { ...attrs, href: props.to }, slots.default?.()),
  }))
  for (const name of ['PressNavBarSearch', 'PressNavBarMenu', 'PressNavBarTranslations', 'PressNavBarAppearance', 'PressNavBarSocialLinks', 'PressNavBarHamburger'])
    app.component(name, { render: () => null })

  return { app, i18n }
}

function expectBrand(container: HTMLElement, title: string) {
  const brand = container.querySelector('.pr-navbar-brand')
  expect.soft(brand?.textContent).toBe(title)
  expect.soft(brand?.getAttribute('aria-label')).toBe(title)
}

beforeEach(() => {
  siteConfig.value.title = $t('siteConfig.title')
})

it.each([
  ['en', 'English Version'],
  ['zh-CN', '中文版本'],
])('translates the navbar title and accessible name during SSR in %s', async (locale, title) => {
  const { app } = createNavApp(true, locale)
  const container = document.createElement('div')
  container.innerHTML = await renderToString(app)
  expectBrand(container, title)
})

it('updates the navbar title and accessible name when switching languages', async () => {
  const { app, i18n } = createNavApp(false, 'en')
  const container = document.createElement('div')
  app.mount(container)
  try {
    expectBrand(container, 'English Version')
    i18n.global.locale.value = 'zh-CN'
    await nextTick()
    expectBrand(container, '中文版本')
    i18n.global.locale.value = 'en'
    await nextTick()
    expectBrand(container, 'English Version')
  }
  finally {
    app.unmount()
  }
})

it.each(['en', 'zh-CN'])('preserves a literal navbar title and accessible name in %s', async (locale) => {
  siteConfig.value.title = 'My literal blog'
  const { app } = createNavApp(true, locale)
  const container = document.createElement('div')
  container.innerHTML = await renderToString(app)
  expectBrand(container, 'My literal blog')
})
