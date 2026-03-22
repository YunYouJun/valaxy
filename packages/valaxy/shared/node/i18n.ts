import fs from 'fs-extra'
import yaml from 'js-yaml'
import { isLocaleKey, stripLocalePrefix } from '../utils/i18n'

export const NODE_I18N: {
  locales: Record<string, any>
} = {
  /**
   * node 读取的 locales 数据
   */
  locales: {},
}

/**
 * Track which paths have already been loaded to avoid redundant I/O.
 */
const _loadedPaths = new Set<string>()

/**
 * 读取翻译 yml 文件
 *
 * Results are cached by resolved path — subsequent calls with the same
 * `localesPath` return the existing `NODE_I18N.locales` without re-reading
 * the filesystem.  Pass `force = true` to bypass the cache (e.g. after
 * the user edits a locale file).
 */
export function loadLocalesYml(localesPath: string, force = false): Record<string, any> {
  if (!force && _loadedPaths.has(localesPath))
    return NODE_I18N.locales

  /**
   * read locales dir *.yml
   */
  const locales: Record<string, any> = {}
  if (fs.existsSync(localesPath)) {
    const files = fs.readdirSync(localesPath)
    files.forEach((file) => {
      if (file.endsWith('.yml') || file.endsWith('.yaml')) {
        const lang = file.replace(/\.ya?ml$/, '')
        const filePath = `${localesPath}/${file}`
        try {
          const content = fs.readFileSync(filePath, 'utf-8')
          const data = yaml.load(content)
          locales[lang] = data || {}
        }
        catch (e) {
          console.error(`Error loading locale file: ${filePath}`, e)
        }
      }
    })
  }

  // cache
  NODE_I18N.locales = locales
  _loadedPaths.add(localesPath)
  return locales
}

/**
 * node translate function
 *
 * ```ts
 * nodeT('greeting.hello', 'en') // 'Hello'
 * ```
 */
export function nodeT(key: string, lang: string): string {
  if (isLocaleKey(key))
    key = stripLocalePrefix(key)

  const data = NODE_I18N.locales[lang] || {}
  const keys = key.split('.')
  let result: any = data
  for (const k of keys) {
    result = result?.[k]
    if (result === undefined)
      return ''
  }
  return result || ''
}
