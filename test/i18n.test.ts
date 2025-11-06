import { describe, expect, it } from 'vitest'
import { NODE_I18N, nodeT } from '../packages/valaxy/shared/node/i18n'
import { tObject } from '../packages/valaxy/shared/utils/i18n'

describe('i18n', () => {
  it('tObject with lang', () => {
    const result = tObject({ 'en': 'English', 'zh-CN': '中文' }, 'zh-CN')
    expect(result).toBe('中文')
  })

  it('tObject not found', () => {
    const result = tObject({ 'en': 'English', 'zh-CN': '中文' }, 'es')
    expect(result).toBe('English') // Fallback to first language
  })

  /**
   * nodeT test
   */
  it('nodeT with lang', () => {
    const key = 'greeting.hello'
    const lang = 'en'
    const locales: Record<string, any> = {
      'en': { greeting: { hello: 'Hello' } },
      'zh-CN': { greeting: { hello: '你好' } },
    }
    NODE_I18N.locales = locales

    const result = nodeT(key, lang)
    expect(result).toBe('Hello')
  })
})
