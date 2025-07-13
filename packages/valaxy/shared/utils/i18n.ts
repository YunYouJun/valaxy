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
  if (typeof data === 'object') {
    return data[lang] || Object.values(data)[0] || ''
  }
  return data
}
