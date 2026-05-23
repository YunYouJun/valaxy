import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { hasThemeTemplate, normalizeThemeName, replaceThemeDeps, replaceThemeInConfig } from '../packages/create-valaxy/src/scaffold'

// ─── theme-press dependency check ────────────────────────────────────

describe('valaxy-theme-press dependencies', () => {
  it('declares vitepress as a dependency', () => {
    const pressPkgPath = path.resolve(
      __dirname,
      '../packages/valaxy-theme-press/package.json',
    )
    const pressPkg = JSON.parse(fs.readFileSync(pressPkgPath, 'utf-8'))
    expect(pressPkg.dependencies).toHaveProperty('vitepress')
  })
})

// ─── valaxy peerDependencies check ───────────────────────────────────

describe('valaxy peerDependencies', () => {
  const valaxyPkgPath = path.resolve(
    __dirname,
    '../packages/valaxy/package.json',
  )
  const valaxyPkg = JSON.parse(fs.readFileSync(valaxyPkgPath, 'utf-8'))

  // The markdown transform injects `import { useRoute, useRouter } from 'vue-router'`
  // (and vue imports) into every page. These imports are resolved from the user's
  // project root, so vue and vue-router must surface at `<project>/node_modules/`.
  // Declaring them as peerDependencies makes pnpm 8+/npm 7+/bun auto-install them
  // there (via `auto-install-peers`), removing the dependency on `shamefully-hoist`
  // which broke under Rolldown (Vite 8) with newer pnpm releases.
  // See: https://github.com/YunYouJun/valaxy/issues/701
  it('declares the expected peerDependency ranges', () => {
    expect(valaxyPkg.peerDependencies).toEqual({
      'vue': '^3.5.0',
      'vue-router': '^5.0.0',
    })
  })

  // Avoid double-install / multiple-Vue-instance pitfalls: peers must NOT also
  // appear under `dependencies`. They live in `devDependencies` so local
  // workspace development still resolves them.
  it('does not also list peers under dependencies', () => {
    expect(valaxyPkg.dependencies).not.toHaveProperty('vue')
    expect(valaxyPkg.dependencies).not.toHaveProperty('vue-router')
  })

  it('lists peers under devDependencies for local workspace builds', () => {
    expect(valaxyPkg.devDependencies).toHaveProperty('vue')
    expect(valaxyPkg.devDependencies).toHaveProperty('vue-router')
  })
})

// ─── normalizeThemeName ──────────────────────────────────────────────

describe('normalizeThemeName', () => {
  it('strips valaxy-theme- prefix', () => {
    expect(normalizeThemeName('valaxy-theme-starter')).toBe('starter')
  })

  it('returns short name unchanged', () => {
    expect(normalizeThemeName('press')).toBe('press')
  })

  it('trims whitespace', () => {
    expect(normalizeThemeName('  yun  ')).toBe('yun')
  })

  it('handles empty string', () => {
    expect(normalizeThemeName('')).toBe('')
  })
})

// ─── replaceThemeDeps ────────────────────────────────────────────────

describe('replaceThemeDeps', () => {
  const basePkg = {
    name: 'my-blog',
    dependencies: {
      'valaxy': '0.28.0',
      'valaxy-theme-yun': '0.28.0',
    },
  }

  it('does not modify deps when theme is yun', () => {
    const result = replaceThemeDeps(basePkg, 'yun')
    expect(result.dependencies).toHaveProperty('valaxy-theme-yun')
    expect(Object.keys(result.dependencies)).not.toContain('valaxy-theme-press')
  })

  it('replaces yun dep with selected theme', () => {
    const result = replaceThemeDeps(basePkg, 'press')
    expect(result.dependencies).not.toHaveProperty('valaxy-theme-yun')
    expect(result.dependencies['valaxy-theme-press']).toBe('latest')
    // valaxy core dep should remain
    expect(result.dependencies.valaxy).toBe('0.28.0')
  })

  it('does not mutate the original object', () => {
    const original = JSON.parse(JSON.stringify(basePkg))
    replaceThemeDeps(basePkg, 'press')
    expect(basePkg).toEqual(original)
  })

  it('does not throw when yun dep is absent', () => {
    const pkgWithoutYun = {
      name: 'my-blog',
      dependencies: { valaxy: '0.28.0' },
    }
    const result = replaceThemeDeps(pkgWithoutYun, 'press')
    expect(result.dependencies['valaxy-theme-press']).toBe('latest')
  })
})

// ─── replaceThemeInConfig ────────────────────────────────────────────

describe('replaceThemeInConfig', () => {
  const sampleConfig = [
    `import type { UserThemeConfig } from 'valaxy-theme-yun'`,
    `import { defineValaxyConfig } from 'valaxy'`,
    ``,
    `export default defineValaxyConfig<UserThemeConfig>({`,
    `  theme: 'yun',`,
    `  themeConfig: {`,
    `    banner: { enable: true },`,
    `  },`,
    `  unocss: { safelist: [] },`,
    `})`,
  ].join('\n')

  it('returns content unchanged when theme is yun', () => {
    expect(replaceThemeInConfig(sampleConfig, 'yun')).toBe(sampleConfig)
  })

  it('replaces theme name', () => {
    const result = replaceThemeInConfig(sampleConfig, 'press')
    expect(result).toContain(`theme: 'press'`)
    expect(result).not.toContain(`theme: 'yun'`)
  })

  it('comments out import and updates package name', () => {
    const result = replaceThemeInConfig(sampleConfig, 'press')
    expect(result).toContain(`// import type { UserThemeConfig } from 'valaxy-theme-press'`)
  })

  it('removes generic type parameter', () => {
    const result = replaceThemeInConfig(sampleConfig, 'press')
    expect(result).toContain(`defineValaxyConfig({`)
    expect(result).not.toContain(`defineValaxyConfig<UserThemeConfig>`)
  })

  it('clears themeConfig contents', () => {
    const result = replaceThemeInConfig(sampleConfig, 'press')
    expect(result).toContain(`themeConfig: {},`)
  })

  it('preserves unrelated config like unocss', () => {
    const result = replaceThemeInConfig(sampleConfig, 'press')
    expect(result).toContain(`unocss: { safelist: [] }`)
  })

  it('works with real template-blog/valaxy.config.ts', () => {
    const templatePath = path.resolve(
      __dirname,
      '../packages/create-valaxy/template-blog/valaxy.config.ts',
    )
    const content = fs.readFileSync(templatePath, 'utf-8')
    const result = replaceThemeInConfig(content, 'starter')

    expect(result).toContain(`theme: 'starter'`)
    expect(result).toContain(`// import type { UserThemeConfig } from 'valaxy-theme-starter'`)
    expect(result).toContain(`defineValaxyConfig({`)
    expect(result).toContain(`themeConfig: {},`)
    expect(result).toContain(`unocss: { safelist }`)
  })

  it('snapshot: press theme config replacement', () => {
    const result = replaceThemeInConfig(sampleConfig, 'press')
    expect(result).toMatchInlineSnapshot(`
      "// import type { UserThemeConfig } from 'valaxy-theme-press'
      import { defineValaxyConfig } from 'valaxy'

      export default defineValaxyConfig({
        theme: 'press',
        themeConfig: {},
        unocss: { safelist: [] },
      })"
    `)
  })
})

// ─── hasThemeTemplate ────────────────────────────────────────────────

describe('hasThemeTemplate', () => {
  it('returns true for press theme', () => {
    expect(hasThemeTemplate('press')).toBe(true)
  })

  it('returns false for yun theme', () => {
    expect(hasThemeTemplate('yun')).toBe(false)
  })

  it('returns false for non-existent theme', () => {
    expect(hasThemeTemplate('nonexistent')).toBe(false)
  })
})

// ─── template-blog-press contents ────────────────────────────────────

describe('template-blog-press', () => {
  const templateDir = path.resolve(
    __dirname,
    '../packages/create-valaxy/template-blog-press',
  )

  it('contains pages/index.md', () => {
    expect(fs.existsSync(path.join(templateDir, 'pages/index.md'))).toBe(true)
  })

  it('contains valaxy.config.ts with press theme', () => {
    const content = fs.readFileSync(path.join(templateDir, 'valaxy.config.ts'), 'utf-8')
    expect(content).toContain(`theme: 'press'`)
  })

  it('contains site.config.ts', () => {
    expect(fs.existsSync(path.join(templateDir, 'site.config.ts'))).toBe(true)
  })
})
