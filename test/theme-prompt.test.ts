import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { createThemePrompt } from '../docs/data/theme-prompt'

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
    expect(prompt).toContain('styles/index.scss')
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
