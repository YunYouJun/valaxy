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
export function tObject(data: string | Record<string, string>, lang: string): string {
  if (typeof data === 'object') {
    return data[lang] || Object.values(data)[0] || ''
  }
  return data
}
