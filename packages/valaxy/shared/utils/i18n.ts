import { LOCALE_PREFIX } from '../constants'

export type TaxonomyNamespace = 'tag' | 'category'

/**
 * translate object
 *
 * { 'en': 'English', 'zh-CN': '中文' }
 *
 * ```ts
 * tObject({ 'en': 'English', 'zh-CN': '中文' }, 'zh-CN') // 中文
 * tObject({ 'en': 'English', 'zh-CN': '中文' }, 'en') // English
 * tObject({ 'en': 'English', 'zh-CN': '中文' }, 'fr') // English
 * ```
 */
export function tObject<T = string>(data: string | Record<string, T>, lang: string): T | string {
  if (data && typeof data === 'object') {
    return data[lang] || Object.values(data)[0] || ''
  }
  return data
}

/**
 * Whether the value is an explicit locale key like `$locale:tag.notes`.
 */
export function isLocaleKey(value: string): boolean {
  return value.startsWith(LOCALE_PREFIX)
}

/**
 * Strip `$locale:` prefix when present.
 */
export function stripLocalePrefix(value: string): string {
  return isLocaleKey(value) ? value.slice(LOCALE_PREFIX.length) : value
}

/**
 * Resolve a nested locale message value by dot-separated key.
 */
export function getLocaleMessageValue(messages: Record<string, any> | undefined, key: string): any {
  return key.split('.').reduce<any>((result, part) => result?.[part], messages)
}

/**
 * Whether a locale message exists for the given key.
 */
export function hasLocaleMessage(messages: Record<string, any> | undefined, key: string): boolean {
  return getLocaleMessageValue(messages, key) !== undefined
}

/**
 * Resolve the effective locale key for a taxonomy term.
 *
 * - `$locale:tag.notes` -> `tag.notes` (explicit locale key)
 * - `notes` in `tag` namespace -> `tag.notes`
 */
export function resolveTaxonomyLocaleKey(namespace: TaxonomyNamespace, rawValue: string): {
  localeKey: string
  isExplicitLocaleKey: boolean
} {
  if (isLocaleKey(rawValue)) {
    return {
      localeKey: stripLocalePrefix(rawValue),
      isExplicitLocaleKey: true,
    }
  }

  return {
    localeKey: `${namespace}.${rawValue}`,
    isExplicitLocaleKey: false,
  }
}
