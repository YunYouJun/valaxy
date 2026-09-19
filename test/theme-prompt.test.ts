import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { getThemePreset } from '../docs/data/theme-presets'
import { createThemeBrief, createThemePrompt, normalizeThemeName } from '../docs/data/theme-prompt'

describe('ai theme prompt', () => {
  it('normalizes the package name and includes the user brief', () => {
    const prompt = createThemePrompt('en', {
      name: 'valaxy-theme-aurora',
      visualDirection: 'Editorial layout with warm colors',
      features: 'Home hero and article table of contents',
    })

    expect(prompt).toContain('Package: valaxy-theme-aurora')
    expect(prompt).not.toContain('valaxy-theme-valaxy-theme-aurora')
    expect(prompt).toContain('Editorial layout with warm colors')
    expect(prompt).toContain('Home hero and article table of contents')
  })

  it.each([
    ['en', 'components/ValaxyMain.vue', 'defineTheme()', 'defineAppSetup()', 'pnpm typecheck'],
    ['zh', 'components/ValaxyMain.vue', 'defineTheme()', 'defineAppSetup()', 'pnpm typecheck'],
  ] as const)('keeps the %s prompt implementation contract complete', (locale, directory, themeApi, setupApi, validation) => {
    const prompt = createThemePrompt(locale, {
      name: '',
      visualDirection: '',
      features: '',
    })

    expect(prompt).toContain('valaxy-theme-[name]')
    expect(prompt).toContain(directory)
    expect(prompt).toContain('layouts/')
    expect(prompt).toContain('styles/index.ts')
    expect(prompt).toContain(themeApi)
    expect(prompt).toContain(setupApi)
    expect(prompt).toContain('ValaxyMd')
    expect(prompt).toContain('--va-*')
    expect(prompt).toContain(validation)
    expect(prompt).toContain('pnpm build')
  })

  it('tells the agent to verify APIs instead of guessing', () => {
    const prompt = createThemePrompt('en', {
      name: 'aurora',
      visualDirection: '',
      features: '',
    })

    expect(prompt).toContain('exports, type declarations, and theme development documentation')
    expect(prompt).toContain('instead of inventing an API')
  })
})

describe('prompt controls accessibility', () => {
  const componentDir = path.resolve(__dirname, '../docs/components')

  it('announces copy state and exposes a labelled button', () => {
    const source = fs.readFileSync(path.join(componentDir, 'PromptCopy.vue'), 'utf8')

    expect(source).toContain('type="button"')
    expect(source).toContain(':aria-label=')
    expect(source).toContain('aria-live="polite"')
    expect(source).toContain(':focus-visible')
  })

  it('exposes migration choices as pressed buttons in a labelled group', () => {
    const source = fs.readFileSync(path.join(componentDir, 'MigrationPrompt.vue'), 'utf8')

    expect(source).toContain('role="group"')
    expect(source).toContain(':aria-label=')
    expect(source).toContain(':aria-pressed=')
    expect(source).toContain('type="button"')
  })
})

describe('theme authoring workflow', () => {
  it.each(['../escape', 'my theme', 'x; rm -rf .', '$(whoami)', 'a`pwd`', 'ATheme', '-foo', 'a'.repeat(61)])('rejects an unsafe package suffix: %s', (name) => {
    expect(normalizeThemeName(name)).toBe('')
    expect(createThemePrompt('en', { name, features: '', visualDirection: '', workspace: 'starter' })).toContain('valaxy-theme-[name]')
  })

  it.each(['en', 'zh'] as const)('creates a complete AK UI brief in %s', (locale) => {
    const preset = getThemePreset('arknights', locale)
    const prompt = createThemePrompt(locale, preset)
    expect(preset.name).toBe('arknights')
    expect(prompt).toContain('pnpm dlx degit valaxyjs/valaxy-theme-starter valaxy-theme-arknights')
    expect(prompt).toContain('@yunyoujun/ak-ui/style.css')
    expect(prompt).toContain('valaxy build --ssg')
    expect(prompt).toContain('theme/')
    expect(prompt).toContain('demo/')
  })

  it('does not scaffold over an existing theme or add AK UI to a custom brief', () => {
    const prompt = createThemePrompt('en', { ...getThemePreset('editorial', 'en'), workspace: 'existing' })
    expect(prompt).not.toContain('pnpm dlx degit')
    expect(prompt).not.toContain('@yunyoujun/ak-ui/style.css')
  })
})

describe('skill brief and standalone prompt', () => {
  it.each(['en', 'zh'] as const)('preserves the same editable design in both %s formats', (locale) => {
    const options = { ...getThemePreset('arknights', locale), name: 'my-archive', visualDirection: 'Blue ink / 蓝色墨水', features: 'Accessible search / 无障碍搜索' }
    const brief = createThemeBrief(locale, options)
    const standalone = createThemePrompt(locale, options)
    for (const output of [brief, standalone]) {
      expect(output).toContain('valaxy-theme-my-archive')
      expect(output).toContain(options.visualDirection)
      expect(output).toContain(options.features)
      expect(output).toContain('AK UI')
    }
    expect(brief).toContain('valaxy-theme Skill')
    expect(brief).not.toContain('defineTheme()')
    expect(brief.length).toBeLessThan(standalone.length / 2)
    expect(standalone).toContain('defineTheme()')
    expect(standalone).toContain('valaxy build --ssg')
  })

  it.each([createThemeBrief, createThemePrompt])('keeps an existing custom theme independent of starter commands and AK UI', (generate) => {
    const options = { ...getThemePreset('editorial', 'en'), workspace: 'existing' as const }
    const output = generate('en', options)
    expect(output).not.toContain('pnpm dlx degit')
    expect(output).not.toContain('pnpm theme:init')
    expect(output).not.toContain('ak-ui')
    expect(output).toContain('package names')
  })
})
