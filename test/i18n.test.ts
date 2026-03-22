import { describe, expect, it } from 'vitest'
import { NODE_I18N, nodeT } from '../packages/valaxy/shared/node/i18n'
import { hasLocaleMessage, isLocaleKey, resolveTaxonomyLocaleKey, stripLocalePrefix, tObject } from '../packages/valaxy/shared/utils/i18n'

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

  it('resolves raw taxonomy terms to namespace-prefixed locale keys', () => {
    expect(resolveTaxonomyLocaleKey('tag', 'notes')).toEqual({
      localeKey: 'tag.notes',
      isExplicitLocaleKey: false,
    })
  })

  it('preserves explicit locale keys when resolving taxonomy terms', () => {
    expect(resolveTaxonomyLocaleKey('category', '$locale:category.test')).toEqual({
      localeKey: 'category.test',
      isExplicitLocaleKey: true,
    })
    expect(stripLocalePrefix('$locale:category.test')).toBe('category.test')
  })

  it('checks nested locale message existence via shared helper', () => {
    expect(hasLocaleMessage({ tag: { notes: '笔记' } }, 'tag.notes')).toBe(true)
    expect(hasLocaleMessage({ tag: {} }, 'tag.notes')).toBe(false)
  })

  it('isLocaleKey detects $locale: prefix correctly', () => {
    expect(isLocaleKey('$locale:tag.notes')).toBe(true)
    expect(isLocaleKey('notes')).toBe(false)
    expect(isLocaleKey('')).toBe(false)
  })

  it('stripLocalePrefix is a no-op for non-locale keys', () => {
    expect(stripLocalePrefix('plain-tag')).toBe('plain-tag')
  })
})
