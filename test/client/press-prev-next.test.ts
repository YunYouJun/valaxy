import { expect, it, vi } from 'vitest'
import { effectScope, ref } from 'vue'
import { usePrevNext } from '../../packages/valaxy-theme-press/composables/prev-next'

const t = vi.hoisted(() => vi.fn((key: string) => `translated:${key}`))
const pages = ref([])
const config = ref({
  sidebar: [{ text: 'API', items: Array.from({ length: 300 }, (_, i) => ({ text: `symbol-${i}`, link: `/api/${i}` })) }],
})
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t }) }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/api/150' }) }))
vi.mock('../../packages/valaxy-theme-press/composables/locale', () => ({
  useLocaleConfig: () => ({ localeConfig: config, currentLocaleKey: ref('root'), hasLocales: ref(false), currentLocale: ref({ link: '/' }) }),
}))
vi.mock('valaxy', () => ({
  isCategoryList: () => false,
  removeItemFromCategory: vi.fn(),
  useFrontmatter: () => ref({}),
  usePageList: () => pages,
  useValaxyI18n: () => ({ $tO: (value: string) => value }),
}))

it('translates only the two visible footer links in a large API sidebar', () => {
  const scope = effectScope()
  try {
    const links = scope.run(() => usePrevNext())!
    expect(links.value).toEqual({
      prev: { text: 'translated:symbol-149', link: '/api/149' },
      next: { text: 'translated:symbol-151', link: '/api/151' },
    })
    expect(t).toHaveBeenCalledTimes(2)
  }
  finally {
    scope.stop()
  }
})
