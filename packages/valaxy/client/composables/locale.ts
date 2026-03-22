import type { Ref } from 'vue'
import type { TaxonomyNamespace } from '../../shared/utils/i18n'
import { isClient, useStorage } from '@vueuse/core'
import dayjs from 'dayjs'

import { computed, watch } from 'vue'
// not optimize deps all locales
import { useI18n } from 'vue-i18n'
import { isLocaleKey, resolveTaxonomyLocaleKey, stripLocalePrefix, tObject } from '../../shared/utils/i18n'
import 'dayjs/locale/en'
import 'dayjs/locale/zh-cn'

export function useLocale() {
  const { availableLocales, locale } = useI18n()
  const lang = useStorage('valaxy-locale', locale.value)
  // set date locale
  // setDefaultOptions({ locale: locale.value === 'zh-CN' ? zhCN : enUS })
  dayjs.locale(locale.value === 'zh-CN' ? 'zh-cn' : 'en')

  /**
   * toggle to new locale
   * @param newLocale
   */
  function toggleLocale(newLocale: string) {
    locale.value = newLocale
    // for localStorage
    lang.value = newLocale
    // set date locale
    // setDefaultOptions({ locale: locale.value === 'zh-CN' ? zhCN : enUS })
    dayjs.locale(newLocale === 'zh-CN' ? 'zh-cn' : 'en')
    if (isClient)
      document.documentElement.setAttribute('lang', newLocale)
  }

  const toggleLocales = () => {
    // change to some real logic
    const locales = availableLocales
    locale.value = locales[(locales.indexOf(locale.value) + 1) % locales.length]
    const newLocale = locale.value
    toggleLocale(newLocale)
  }

  return {
    lang,
    toggleLocale,
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
  const { t, locale } = useI18n()
  return computed(() => {
    if (!fm.value)
      return ''

    const lang = locale.value
    const title = tObject(fm.value.title || '', lang) || ''
    if (typeof title === 'string' && isLocaleKey(title))
      return t(stripLocalePrefix(title))
    return title
  })
}

/**
 * @experimental
 * 以 `$locale:` 开头的 key 会被认为是国际化的 key
 * 会从 locales/ 目录中获取对应的翻译
 */
export function useValaxyI18n() {
  const { t, te, locale } = useI18n()
  const termCache = new Map<string, string>()

  // Clear cache on locale switches so each composable instance stays bounded.
  watch(locale, () => termCache.clear())

  /**
   * translate `$locale:key`
   * @param key
   */
  const $t = (key: string) => {
    if (isLocaleKey(key))
      return t(stripLocalePrefix(key))
    return key
  }

  /**
   * translate object
   *
   * {
   *   "zh-CN": "你好",
   *   "en": "Hello"
   * }
   */
  const $tO = <T = string>(data?: string | Record<string, T>) => {
    return tObject(data || '', locale.value)
  }

  /**
   * @en
   * Translate a taxonomy term.
   *
   * Resolution order:
   * 1. `$locale:` prefix → strip and translate via `t()`
   * 2. Locale key `{namespace}.{key}` exists → translate via `t()`
   * 3. Fallback → return the original key as-is
   *
   * The result is cached by `locale + namespace + key` to avoid repeated
   * `te()` / `t()` lookups in tag clouds and category trees.
   *
   * @zh
   * 翻译 taxonomy 术语。
   *
   * 解析顺序：
   * 1. `$locale:` 前缀 → 去掉前缀后通过 `t()` 翻译
   * 2. locale 中存在 `{namespace}.{key}` → 通过 `t()` 翻译
   * 3. 兜底 → 原样返回
   *
   * 结果会按 `locale + namespace + key` 做轻量缓存，
   * 避免标签云和分类树中重复执行 `te()` / `t()`。
   */
  const $tTerm = (namespace: TaxonomyNamespace, key: string) => {
    const cacheKey = `${locale.value}:${namespace}:${key}`
    const cached = termCache.get(cacheKey)
    if (cached !== undefined)
      return cached

    const { localeKey, isExplicitLocaleKey } = resolveTaxonomyLocaleKey(namespace, key)
    const result = isExplicitLocaleKey || te(localeKey)
      ? `${t(localeKey)}`
      : key

    termCache.set(cacheKey, result)
    return result
  }

  const $tTag = (key: string) => $tTerm('tag', key)
  const $tCategory = (key: string) => $tTerm('category', key)

  return {
    locale,
    /**
     * vue-i18n t function
     */
    $t,
    $tO,
    /**
     * translate taxonomy term (auto-lookup `{namespace}.{key}` in locale files)
     */
    $tTerm,
    /**
     * translate tag name (auto-lookup `tag.{key}` in locale files)
     */
    $tTag,
    /**
     * translate category name (auto-lookup `category.{key}` in locale files)
     */
    $tCategory,
  }
}
