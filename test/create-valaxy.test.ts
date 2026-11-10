import fs from 'node:fs'
import path from 'node:path'
import { load } from 'js-yaml'
import { describe, expect, it } from 'vitest'
import { hasThemeTemplate, normalizeThemeName, replaceThemeDeps, replaceThemeInConfig } from '../packages/create-valaxy/src/scaffold'

// ─── theme-press dependency check ────────────────────────────────────

describe('valaxy-theme-press dependencies', () => {
  it('ships documentation styles without a vitepress dependency', () => {
    const pressPkgPath = path.resolve(
      __dirname,
      '../packages/valaxy-theme-press/package.json',
    )
    const pressPkg = JSON.parse(fs.readFileSync(pressPkgPath, 'utf-8'))
    expect(pressPkg.dependencies).not.toHaveProperty('vitepress')
    for (const file of ['tokens.css', 'code.css', 'code-group.css', 'doc.css'])
      expect(fs.existsSync(path.resolve(path.dirname(pressPkgPath), 'styles', file))).toBe(true)
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
      'vue': '^3.5.41',
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

describe('blog scaffold peer dependencies', () => {
  it('installs the same required Vue peers as Valaxy for projects disabling auto-install', () => {
    const core = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../packages/valaxy/package.json'), 'utf8'))
    const template = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../packages/create-valaxy/template-blog/package.json'), 'utf8'))
    for (const [name, range] of Object.entries(core.peerDependencies))
      expect(template.dependencies[name]).toBe(range)
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
    expect(result.dependencies['valaxy-theme-press']).toBe('0.28.0')
    // valaxy core dep should remain
    expect(result.dependencies.valaxy).toBe('0.28.0')
  })

  it('keeps the coordinated Press theme on the prepared stable version', () => {
    const result = replaceThemeDeps({ dependencies: { valaxy: '1.0.0' } }, 'press')
    expect(result.dependencies['valaxy-theme-press']).toBe('1.0.0')
  })

  it('keeps third-party themes on their independently published channel', () => {
    const result = replaceThemeDeps(basePkg, 'starter')
    expect(result.dependencies['valaxy-theme-starter']).toBe('latest')
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
    expect(result.dependencies['valaxy-theme-press']).toBe('0.28.0')
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

  it('enables llms.txt and leaves MCP commented out', () => {
    const site = fs.readFileSync(path.join(templateDir, 'site.config.ts'), 'utf-8')
    const config = fs.readFileSync(path.join(templateDir, 'valaxy.config.ts'), 'utf-8')
    expect(site).toMatch(/llms:\s*\{[^}]*enable:\s*true/)
    expect(site).toContain('https://example.com/')
    expect(site).not.toContain('valaxy.site')
    expect(config).toContain('https://valaxy.site/guide/work-with-ai#mcp')
    expect(config).not.toMatch(/^\s*mcp:\s*true/m)
  })
})

describe('scaffold package manager', () => {
  it.each(['blog', 'addon'])('pins the repository pnpm version in the %s template', (template) => {
    const root = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'))
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../packages/create-valaxy/template-${template}/package.json`), 'utf-8'))

    expect(pkg.packageManager).toMatch(/^pnpm@\d+\.\d+\.\d+$/)
    expect(pkg.packageManager).toBe(root.packageManager)
  })
})

describe('blog scaffold GitHub Pages workflow', () => {
  const blogDir = path.resolve(__dirname, '../packages/create-valaxy/template-blog')
  const workflowPath = path.join(blogDir, '.github/workflows/gh-pages.yml')

  it('builds with pnpm and deploys through GitHub Pages actions', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(blogDir, 'package.json'), 'utf-8'))
    const workflow = fs.readFileSync(workflowPath, 'utf-8')

    expect(pkg.engines.node).toBe('>=22.12.0')
    expect(pkg.scripts.build).toBe('valaxy build --ssg')
    expect(fs.existsSync(path.join(blogDir, 'pnpm-lock.yaml'))).toBe(false)

    expect(workflow).toContain('actions/checkout@v7')
    expect(workflow).toContain('pnpm/action-setup@v6')
    expect(workflow).toContain('actions/setup-node@v7')
    expect(workflow).toContain('node-version: lts/*')
    expect(workflow).toContain('actions/configure-pages@v6')
    expect(workflow).toContain('actions/upload-pages-artifact@v5')
    expect(workflow).toContain('actions/deploy-pages@v5')
    expect(workflow).toContain('path: dist')
    expect(workflow).toMatch(/^ {8}run: pnpm install$/m)
    expect(workflow).toContain('run: pnpm run build')
    expect(workflow).toContain('contents: read')
    expect(workflow).toContain('pages: write')
    expect(workflow).toContain('id-token: write')
    expect(workflow).toContain('name: github-pages')
    expect(workflow).toMatch(/concurrency:[\s\S]*?group: pages/)
    expect(workflow).toContain('fetch-depth: 0')
    expect(workflow).not.toContain('frozen-lockfile')
    expect(workflow).not.toMatch(/(?<![a-z])npm\b/)
    expect(workflow).not.toContain('peaceiris')
    expect(workflow).not.toContain('force_orphan')
    expect(workflow).not.toContain('actions/checkout@v2')
    expect(workflow).not.toContain('actions/setup-node@v2')
  })

  it('reads the pinned pnpm version and uploads hidden resources from dist', () => {
    const workflow = load(fs.readFileSync(workflowPath, 'utf-8')) as {
      jobs: { build: { steps: { uses?: string, with?: Record<string, unknown> }[] } }
    }
    const steps = workflow.jobs.build.steps
    const setup = steps.find(step => step.uses === 'pnpm/action-setup@v6')

    expect(setup).toBeDefined()
    expect(setup?.with?.version).toBeUndefined()
    expect(setup?.with?.package_json_file).toBeUndefined()
    expect(steps).toContainEqual(expect.objectContaining({
      uses: 'actions/upload-pages-artifact@v5',
      with: { 'path': 'dist', 'include-hidden-files': true },
    }))
  })

  it('documents GitHub Actions as the Pages source in English and Chinese', () => {
    const english = fs.readFileSync(path.resolve(__dirname, '../docs/pages/guide/deploy.md'), 'utf-8')
    const chinese = fs.readFileSync(path.resolve(__dirname, '../docs/pages/zh/guide/deploy.md'), 'utf-8')

    expect(english).toContain('choose `GitHub Actions` as the Pages source')
    expect(chinese).toContain('将 Pages 的源选择为 `GitHub Actions`')
    for (const page of [english, chinese]) {
      expect(page).not.toContain('read and write permissions')
      expect(page).not.toContain('force_orphan')
      expect(page).not.toContain('gh-pages` branch')
      expect(page).not.toContain('`gh-pages` 分支')
    }
  })
})

describe('ai-ready blog scaffold', () => {
  const blogDir = path.resolve(__dirname, '../packages/create-valaxy/template-blog')
  const pressDir = path.resolve(__dirname, '../packages/create-valaxy/template-blog-press')
  const personalBranding = [
    '云游君',
    '苏ICP备17038157',
    'yunyoujun.cn',
    'cdn.yunyoujun',
    'me@yunyoujun',
    'sponsors/YunYouJun',
  ]

  function textFiles(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory())
        return textFiles(fullPath)
      if (entry.name === 'extensions.json' || /\.(?:png|jpe?g|gif|webp|ico)$/i.test(entry.name))
        return []
      return [fullPath]
    })
  }

  it('ships an author-facing AGENTS.md from the blog template', () => {
    const agents = fs.readFileSync(path.join(blogDir, 'AGENTS.md'), 'utf-8')
    expect(agents).toContain('llms.enable: false')
    expect(agents).toContain('https://valaxy.site/guide/work-with-ai#mcp')
    expect(fs.existsSync(path.join(pressDir, 'AGENTS.md'))).toBe(false)
  })

  it('enables llms.txt without personal site URLs', () => {
    const site = fs.readFileSync(path.join(blogDir, 'site.config.ts'), 'utf-8')
    expect(site).toMatch(/llms:\s*\{[^}]*enable:\s*true/)
    expect(site).toContain('https://example.com/')
    expect(site).toContain('llms.enable: false')
    expect(site).not.toContain('valaxy.site')
  })

  it('keeps MCP opt-in in the Yun template', () => {
    const config = fs.readFileSync(path.join(blogDir, 'valaxy.config.ts'), 'utf-8')
    expect(config).toContain('title: \'我的小站\'')
    expect(config).toContain('https://valaxy.site/guide/work-with-ai#mcp')
    expect(config).not.toMatch(/^\s*mcp:\s*true/m)
    expect(config).toContain('enable: false')
  })

  it('does not ship personal branding in either blog template', () => {
    for (const file of [...textFiles(blogDir), ...textFiles(pressDir)]) {
      const content = fs.readFileSync(file, 'utf-8')
      for (const marker of personalBranding)
        expect(content, file).not.toContain(marker)
    }
  })

  it('keeps the framework llms default off for existing sites', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '../packages/valaxy/node/config/site.ts'), 'utf-8')
    expect(source).toMatch(/llms:\s*\{[^}]*enable:\s*false/)
  })
})
