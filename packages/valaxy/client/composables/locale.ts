import { isClient, useStorage } from '@vueuse/core'
import { enUS } from 'date-fns/locale/en-US'
import { zhCN } from 'date-fns/locale/zh-CN'
import { setDefaultOptions } from 'date-fns/setDefaultOptions'
import { useI18n } from 'vue-i18n'

export function useLocale() {
  const { availableLocales, locale } = useI18n()
  const lang = useStorage('valaxy-locale', locale.value)
  // set date locale
  setDefaultOptions({ locale: locale.value === 'zh-CN' ? zhCN : enUS })

  const toggleLocales = () => {
    // change to some real logic
    const locales = availableLocales

    locale.value = locales[(locales.indexOf(locale.value) + 1) % locales.length]
    // for localStorage
    lang.value = locale.value

    // set date locale
    setDefaultOptions({ locale: locale.value === 'zh-CN' ? zhCN : enUS })

    if (isClient)
      document.documentElement.setAttribute('lang', locale.value)
  }

  return {
    lang,
    toggleLocales,
  }
}
