import { isClient, useStorage } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

export const useLocale = () => {
  const { availableLocales, locale } = useI18n()
  const lang = useStorage('valaxy-locale', locale.value)

  const toggleLocales = () => {
    // change to some real logic
    const locales = availableLocales

    locale.value = locales[(locales.indexOf(locale.value) + 1) % locales.length]
    // for localStorage
    lang.value = locale.value

    if (isClient)
      document.documentElement.setAttribute('lang', locale.value)
  }

  return {
    lang,
    toggleLocales,
  }
}
