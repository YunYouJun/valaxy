import { isClient, useStorage } from '@vueuse/core'
import dayjs from 'dayjs'
// not optimize deps all locales
import { useI18n } from 'vue-i18n'

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
