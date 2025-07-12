import type { Ref } from 'vue'
import { isClient, useStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import { computed } from 'vue'

// not optimize deps all locales
import { useI18n } from 'vue-i18n'
import { tObject } from '../../shared/utils/i18n'
import 'dayjs/locale/en'
import 'dayjs/locale/zh-cn'

export function useLocale() {
  const { availableLocales, locale } = useI18n()
  const lang = useStorage('valaxy-locale', locale.value)
  // set date locale
  // setDefaultOptions({ locale: locale.value === 'zh-CN' ? zhCN : enUS })
  dayjs.locale(locale.value === 'zh-CN' ? 'zh-cn' : 'en')

  const toggleLocales = () => {
    // change to some real logic
    const locales = availableLocales

    locale.value = locales[(locales.indexOf(locale.value) + 1) % locales.length]
    // for localStorage
    lang.value = locale.value

    // set date locale
    // setDefaultOptions({ locale: locale.value === 'zh-CN' ? zhCN : enUS })
    dayjs.locale(locale.value === 'zh-CN' ? 'zh-cn' : 'en')

    if (isClient)
      document.documentElement.setAttribute('lang', locale.value)
  }

  return {
    lang,
    toggleLocales,
  }
}

/**
 * get locale title
 *
 * ```md
 * ---
 * title:
 *   zh-CN: Valaxy - Vue 驱动的静态站点生成器
 *   en: Valaxy - Vue Powered Static Site Generator
 * ---
 * ```
 *
 * @param fm
 */
export function useLocaleTitle(fm: Ref<{
  title?: string | Record<string, string>
} | null>) {
  const { locale } = useI18n()
  return computed(() => {
    if (!fm.value)
      return ''

    const lang = locale.value
    return tObject(fm.value.title || '', lang) || ''
  })
}
