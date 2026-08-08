import { afterEach, describe, expect, it, vi } from 'vitest'
import { withBase } from '../../packages/valaxy/client/utils/path'

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
