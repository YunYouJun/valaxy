import type { PressTheme } from '../types'
import { useLocale } from 'valaxy'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeConfig } from './config'

export interface LocaleData {
  key: string
  label: string
  lang?: string
  link: string
}

export function useLocaleConfig() {
  const themeConfig = useThemeConfig()
  const route = useRoute()

  const currentLocaleKey = computed(() => {
    const locales = themeConfig.value.locales
    if (!locales)
      return 'root'

    const path = route.path
    let matchedKey = 'root'
    let matchedLen = 0

    for (const key of Object.keys(locales)) {
      if (key === 'root')
        continue
      const link = locales[key].link || `/${key}/`
      if (path.startsWith(link) && link.length > matchedLen) {
        matchedKey = key
        matchedLen = link.length
      }
    }

    return matchedKey
  })

  const currentLocale = computed<LocaleData>(() => {
    const locales = themeConfig.value.locales
    const key = currentLocaleKey.value
    if (!locales || !locales[key]) {
      return { key: 'root', label: '', link: '/' }
    }
    const cfg = locales[key]
    return {
      key,
      label: cfg.label || key,
      lang: cfg.lang,
      link: cfg.link || (key === 'root' ? '/' : `/${key}/`),
    }
  })

  const hasLocales = computed(() => {
    const locales = themeConfig.value.locales
    return !!locales && Object.keys(locales).length > 1
  })

  const i18nRouting = computed(() => {
    return themeConfig.value.i18nRouting ?? false
  })

  const availableLocales = computed<LocaleData[]>(() => {
    const locales = themeConfig.value.locales
    if (!locales)
      return []
    return Object.keys(locales).map((key) => {
      const cfg = locales[key]
      return {
        key,
        label: cfg.label || key,
        lang: cfg.lang,
        link: cfg.link || (key === 'root' ? '/' : `/${key}/`),
      }
    })
  })

  const localeConfig = computed<PressTheme.Config>(() => {
    const base = themeConfig.value
    const locales = base.locales
    const key = currentLocaleKey.value
    if (!locales || key === 'root' || !locales[key]?.themeConfig)
      return base

    return { ...base, ...locales[key].themeConfig }
  })

  function getLocalePath(targetKey: string): string {
    const locales = themeConfig.value.locales
    if (!locales)
      return '/'

    const targetCfg = locales[targetKey]
    const targetLink = targetCfg?.link || (targetKey === 'root' ? '/' : `/${targetKey}/`)

    if (!i18nRouting.value)
      return targetLink

    const currentLink = currentLocale.value.link
    const path = route.path

    // Strip current locale prefix to get the relative path
    let relativePath: string
    if (currentLocaleKey.value === 'root') {
      relativePath = path
    }
    else {
      relativePath = path.startsWith(currentLink)
        ? path.slice(currentLink.length - 1) // Keep leading "/"
        : path
    }

    // Prepend target locale prefix
    if (targetKey === 'root') {
      return relativePath || '/'
    }

    // Ensure targetLink ends with "/" and relativePath starts with "/"
    const base = targetLink.endsWith('/') ? targetLink.slice(0, -1) : targetLink
    return `${base}${relativePath}`
  }

  // Sync vue-i18n locale with route-based locale so that UI strings
  // (banner, nav labels, features, etc.) follow the current locale.
  const { toggleLocale } = useLocale()
  watch(currentLocale, (loc) => {
    if (loc.lang)
      toggleLocale(loc.lang)
  }, { immediate: true })

  return {
    localeConfig,
    hasLocales,
    i18nRouting,
    currentLocale,
    currentLocaleKey,
    availableLocales,
    getLocalePath,
  }
}
