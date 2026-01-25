import { normalizeRepositoryUrl } from '@valaxyjs/utils'
import { describe, expect, it } from 'vitest'

describe('normalizeRepositoryUrl', () => {
  it('removes git+ prefix from repository URL', () => {
    const input = 'git+https://github.com/YunYouJun/valaxy.git'
    const expected = 'https://github.com/YunYouJun/valaxy.git'
    expect(normalizeRepositoryUrl(input)).toBe(expected)
  })

  it('handles URLs without git+ prefix', () => {
    const input = 'https://github.com/YunYouJun/valaxy.git'
    expect(normalizeRepositoryUrl(input)).toBe(input)
  })

  it('handles HTTP URLs with git+ prefix', () => {
    const input = 'git+http://example.com/repo.git'
    const expected = 'http://example.com/repo.git'
    expect(normalizeRepositoryUrl(input)).toBe(expected)
  })

  it('handles SSH URLs without git+ prefix', () => {
    const input = 'git@github.com:YunYouJun/valaxy.git'
    expect(normalizeRepositoryUrl(input)).toBe(input)
  })

  it('handles empty string', () => {
    expect(normalizeRepositoryUrl('')).toBe('')
  })

  it('handles URLs with git+ in the middle (should not modify)', () => {
    const input = 'https://example.com/git+repo.git'
    expect(normalizeRepositoryUrl(input)).toBe(input)
  })

  it('only removes git+ prefix at the start', () => {
    const input = 'git+git+https://github.com/user/repo.git'
    const expected = 'git+https://github.com/user/repo.git'
    expect(normalizeRepositoryUrl(input)).toBe(expected)
  })

  it('handles npm-style repository URLs', () => {
    const input = 'git+https://github.com/npm/cli.git'
    const expected = 'https://github.com/npm/cli.git'
    expect(normalizeRepositoryUrl(input)).toBe(expected)
  })

  it('preserves URL fragments and query parameters', () => {
    const input = 'git+https://github.com/user/repo.git#main?foo=bar'
    const expected = 'https://github.com/user/repo.git#main?foo=bar'
    expect(normalizeRepositoryUrl(input)).toBe(expected)
  })
})
