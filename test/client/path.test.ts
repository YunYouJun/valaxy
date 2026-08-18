import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveSiteUrl, withBase } from '../../packages/valaxy/client/utils/path'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('withBase', () => {
  it('prepends Vite base to root-absolute internal paths', () => {
    vi.stubEnv('BASE_URL', '/repo/')
    expect(withBase('/image.png')).toBe('/repo/image.png')
    expect(withBase('/guide/')).toBe('/repo/guide/')
  })

  it('leaves external and relative paths unchanged', () => {
    vi.stubEnv('BASE_URL', '/repo/')
    expect(withBase('https://example.com/image.png')).toBe('https://example.com/image.png')
    expect(withBase('//cdn.example.com/image.png')).toBe('//cdn.example.com/image.png')
    expect(withBase('./image.png')).toBe('./image.png')
    expect(withBase('#section')).toBe('#section')
  })
})

describe('resolveSiteUrl', () => {
  it('preserves a canonical site URL deployment subpath', () => {
    expect(resolveSiteUrl('https://example.com/repo/', '/guide/')).toBe('https://example.com/repo/guide/')
    expect(resolveSiteUrl('https://example.com/repo', 'image.png')).toBe('https://example.com/repo/image.png')
  })

  it('leaves external paths and paths without an absolute site URL unchanged', () => {
    expect(resolveSiteUrl('https://example.com/repo/', 'https://cdn.example.com/image.png')).toBe('https://cdn.example.com/image.png')
    expect(resolveSiteUrl('/', '/guide/')).toBe('/guide/')
  })
})
