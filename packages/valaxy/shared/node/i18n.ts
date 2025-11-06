import fs from 'fs-extra'
import yaml from 'js-yaml'
import { LOCALE_PREFIX } from '../constants'

export const NODE_I18N: {
  locales: Record<string, any>
} = {
  /**
   * node 读取的 locales 数据
   */
  locales: {},
}

/**
 * 读取翻译 yml 文件
 */
export function loadLocalesYml(localesPath: string): Record<string, any> {
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
  if (key.startsWith(LOCALE_PREFIX)) {
    key = key.slice(LOCALE_PREFIX.length)
  }
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
