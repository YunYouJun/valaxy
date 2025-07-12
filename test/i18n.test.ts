import { describe, expect, it } from 'vitest'
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
})
