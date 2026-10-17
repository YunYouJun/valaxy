import { afterEach, describe, expect, it, vi } from 'vitest'
import { decodePath, isSamePagePath, resolveSiteUrl, withBase } from '../../packages/valaxy/client/utils/path'

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

describe('decodePath', () => {
  it('decodes percent-encoded non-ASCII paths', () => {
    expect(decodePath('/posts/%E4%B8%AD%E6%96%87Post')).toBe('/posts/中文Post')
    expect(decodePath('/posts/中文Post')).toBe('/posts/中文Post')
  })

  it('returns malformed paths unchanged', () => {
    expect(decodePath('/100%/x')).toBe('/100%/x')
  })
})

describe('isSamePagePath', () => {
  it('matches a raw file path against an encoded pathname', () => {
    expect(isSamePagePath('/posts/中文Post测试.md', '/posts/%E4%B8%AD%E6%96%87Post%E6%B5%8B%E8%AF%95')).toBe(true)
    expect(isSamePagePath('/posts/中文Post测试.md', '/posts/%E4%B8%AD%E6%96%87Post%E6%B5%8B%E8%AF%95/')).toBe(true)
    expect(isSamePagePath('/posts/中文Post测试.md', '/posts/hello-valaxy')).toBe(false)
  })

  it('handles index pages and .html pathnames', () => {
    expect(isSamePagePath('/guide/index.md', '/guide/')).toBe(true)
    expect(isSamePagePath('/guide/index.md', '/guide/index.html')).toBe(true)
    expect(isSamePagePath('/about.md', '/about.html')).toBe(true)
    expect(isSamePagePath('/index.md', '/')).toBe(true)
  })

  it('strips the deployment base from the pathname', () => {
    expect(isSamePagePath('/posts/中文.md', '/repo/posts/%E4%B8%AD%E6%96%87', '/repo/')).toBe(true)
    expect(isSamePagePath('/posts/中文.md', '/posts/%E4%B8%AD%E6%96%87', '/repo/')).toBe(true)
  })
})
