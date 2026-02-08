import { describe, expect, it } from 'vitest'
import { generateCdnModuleCode } from '../packages/valaxy/node/plugins/cdn'

describe('cdn plugin', () => {
  describe('generateCdnModuleCode', () => {
    it('generates default export only when no exports specified', () => {
      const code = generateCdnModuleCode({
        name: 'katex',
        global: 'katex',
        url: 'https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.js',
      })
      expect(code).toContain('window["katex"]')
      expect(code).toContain('export default g')
      expect(code).not.toContain('export const')
    })

    it('generates named exports', () => {
      const code = generateCdnModuleCode({
        name: 'vue',
        global: 'Vue',
        url: 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js',
        exports: ['ref', 'computed', 'createApp'],
      })
      expect(code).toContain('window["Vue"]')
      expect(code).toContain('export default g')
      expect(code).toContain('export const ref = g["ref"]')
      expect(code).toContain('export const computed = g["computed"]')
      expect(code).toContain('export const createApp = g["createApp"]')
    })

    it('escapes special characters in global name', () => {
      const code = generateCdnModuleCode({
        name: 'test',
        global: 'it\'s a "test"',
        url: 'https://example.com/test.js',
      })
      expect(code).toContain('window["it\'s a \\"test\\""]')
    })

    it('throws on invalid export names', () => {
      expect(() => generateCdnModuleCode({
        name: 'test',
        global: 'Test',
        url: 'https://example.com/test.js',
        exports: ['valid', 'invalid-name'],
      })).toThrowError(/Invalid export name/)
    })

    it('accepts unicode identifiers in exports', () => {
      const code = generateCdnModuleCode({
        name: 'test',
        global: 'Test',
        url: 'https://example.com/test.js',
        exports: ['$private', '_internal', 'café'],
      })
      expect(code).toContain('export const $private')
      expect(code).toContain('export const _internal')
      expect(code).toContain('export const café')
    })
  })
})
