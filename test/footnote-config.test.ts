import { consola } from 'consola'
import { afterEach, expect, it, vi } from 'vitest'
import { resolveFootnoteConfig } from '../packages/valaxy/node/config/site'
import { mergeValaxyConfig } from '../packages/valaxy/node/config/valaxy'

afterEach(() => vi.restoreAllMocks())

it('uses Reka for sites without legacy settings', () => {
  const warn = vi.spyOn(consola, 'warn').mockImplementation(() => {})
  expect(resolveFootnoteConfig()).toEqual({ preview: 'reka' })
  expect(warn).not.toHaveBeenCalled()
})

it('preserves explicit Floating Vue options and reports the migration path', () => {
  const warn = vi.spyOn(consola, 'warn').mockImplementation(() => {})
  const config = { floatingVue: { placement: 'bottom', themes: { tooltip: { delay: 100 } } } }
  expect(resolveFootnoteConfig(config)).toEqual({ preview: 'floating-vue' })
  expect(config.floatingVue.themes.tooltip.delay).toBe(100)
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('footnote: { preview: \'reka\' }'))
})

it('allows opting into Reka while keeping global v-tooltip configuration', () => {
  const warn = vi.spyOn(consola, 'warn').mockImplementation(() => {})
  expect(resolveFootnoteConfig({ floatingVue: {}, footnote: { preview: 'reka' } })).toEqual({ preview: 'reka' })
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('only configures legacy Floating Vue APIs'))
})

it('allows explicit rollback without custom legacy options', () => {
  expect(resolveFootnoteConfig({ footnote: { preview: 'floating-vue' } })).toEqual({ preview: 'floating-vue' })
})

it('respects user selection when a theme or addon supplies legacy settings', () => {
  vi.spyOn(consola, 'warn').mockImplementation(() => {})
  const inherited = { siteConfig: { floatingVue: { placement: 'bottom' } } }
  expect(resolveFootnoteConfig(mergeValaxyConfig({}, inherited).siteConfig)).toEqual({ preview: 'floating-vue' })
  const user = { siteConfig: { footnote: { preview: 'reka' as const } } }
  expect(resolveFootnoteConfig(mergeValaxyConfig(user, inherited).siteConfig)).toEqual({ preview: 'reka' })
})
