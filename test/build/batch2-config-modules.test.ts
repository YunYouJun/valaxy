import type { ResolvedValaxyOptions } from '../../packages/valaxy/node/types'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import fs from 'fs-extra'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultSiteConfig } from '../../packages/valaxy/node/config/site'
import { execFuse } from '../../packages/valaxy/node/modules/fuse'
import { build as buildLlms } from '../../packages/valaxy/node/modules/llms/utils'
import { createConfigPlugin } from '../../packages/valaxy/node/plugins/extendConfig'
import { resolveEffectiveViteConfig } from '../../packages/valaxy/node/utils/buildConfig'
import { discoverPageFiles } from '../../packages/valaxy/node/utils/pageSources'
import { joinBaseUrl } from '../../packages/valaxy/shared/utils/uri'

const viteMock = vi.hoisted(() => ({ buildCalls: [] as any[] }))
vi.mock('vite', async () => {
  const actual = await vi.importActual<typeof import('vite')>('vite')
  return {
    ...actual,
    build: vi.fn(async (config: any) => {
      viteMock.buildCalls.push(config)
      return config
    }),
  }
})
const { build: runSpaBuild, ssgBuild: runSsgBuild } = await import('../../packages/valaxy/node/build')
const { execBuild } = await import('../../packages/valaxy/node/cli/build')

const tempRoots: string[] = []

async function createProject(name = 'valaxy-b2-cfg-') {
  const dir = await mkdtemp(resolve(tmpdir(), name))
  tempRoots.push(dir)
  await fs.ensureDir(resolve(dir, 'pages'))
  return dir
}

function makeBaseOptions(userRoot: string, overrides: Partial<ResolvedValaxyOptions> = {}): ResolvedValaxyOptions {
  return {
    mode: 'build',
    pkgRoot: userRoot,
    tempDir: resolve(userRoot, '.valaxy'),
    clientRoot: resolve(process.cwd(), 'packages/valaxy/client'),
    userRoot,
    themeRoot: resolve(process.cwd(), 'packages/valaxy-theme-yun'),
    addonRoots: [],
    roots: [userRoot],
    theme: 'yun',
    pages: [],
    addons: [],
    redirects: [],
    configFile: '',
    siteConfigFile: '',
    themeConfigFile: '',
    env: { id: '', links: [] },
    ...overrides,
    config: {
      siteConfig: {
        ...defaultSiteConfig,
        url: 'https://example.com/',
        llms: {
          ...defaultSiteConfig.llms,
          enable: true,
          files: true,
          fullText: true,
        },
        fuse: {
          ...defaultSiteConfig.fuse,
          dataPath: 'search/index.json',
        },
      },
      build: { ignoreDeadLinks: false },
      vite: {},
      ...overrides.config,
    } as any,
  }
}

afterEach(async () => {
  viteMock.buildCalls = []
  await Promise.all(tempRoots.splice(0).map(dir => fs.remove(dir)))
})

describe('batch 2 effective config, root containment & module outputs', () => {
  it('resolves outDir, publicDir, and base consistently across conflicting vite.config.ts, valaxy.config.vite, and CLI --output', async () => {
    const userRoot = await createProject()
    await fs.outputFile(
      resolve(userRoot, 'vite.config.ts'),
      'export default { base: "/vite-base/", publicDir: "static-assets", build: { outDir: "vite-dist" } }\n',
    )

    // 1. Only vite.config.ts sets outDir (no CLI --output) -> vite-dist
    const optFromVite = makeBaseOptions(userRoot)
    const res1 = await resolveEffectiveViteConfig(optFromVite, 'build')
    expect(res1.outDir).toBe(resolve(userRoot, 'vite-dist'))
    expect(optFromVite.outDir).toBe(resolve(userRoot, 'vite-dist'))
    expect(res1.publicDir).toBe(resolve(userRoot, 'static-assets'))
    expect(res1.base).toBe('/vite-base/')

    // 2. valaxy.config.vite overrides vite.config.ts when CLI --output is omitted
    const optFromValaxy = makeBaseOptions(userRoot, {
      config: {
        siteConfig: { ...defaultSiteConfig },
        vite: { build: { outDir: 'valaxy-dist' }, publicDir: false, base: '/valaxy-base/' },
      } as any,
    })
    const res2 = await resolveEffectiveViteConfig(optFromValaxy, 'build')
    expect(res2.outDir).toBe(resolve(userRoot, 'valaxy-dist'))
    expect(res2.publicDir).toBe(false)
    expect(res2.base).toBe('/valaxy-base/')

    // 3. Explicit CLI --output wins over both vite.config.ts and valaxy.config.vite
    const optFromCli = makeBaseOptions(userRoot, {
      config: {
        siteConfig: { ...defaultSiteConfig },
        vite: { build: { outDir: 'valaxy-dist' } },
      } as any,
    })
    const res3 = await resolveEffectiveViteConfig(optFromCli, 'build', {}, 'cli-out')
    expect(res3.outDir).toBe(resolve(userRoot, 'cli-out'))
    expect((res3.viteConfig.build as any).outDir).toBe(resolve(userRoot, 'cli-out'))
    expect(res3.viteConfig.configFile).toBe(false)

    // 4. Subsequent programmatic build overrides previous cached outDir on the same options
    const optReuse = makeBaseOptions(userRoot)
    const first = await resolveEffectiveViteConfig(optReuse, 'build', { build: { outDir: 'first-output' } })
    const second = await resolveEffectiveViteConfig(optReuse, 'build', { build: { outDir: 'second-output' } })
    expect(first.outDir).toBe(resolve(userRoot, 'first-output'))
    expect(second.outDir).toBe(resolve(userRoot, 'second-output'))
    expect((second.viteConfig.build as any).outDir).toBe(resolve(userRoot, 'second-output'))

    // 5. Mode-dependent vite.config.ts receives 'production' by default or explicit caller mode,
    //    and explicit configFile build.outDir is loaded before freezing canonical paths.
    const modeRoot = await createProject('valaxy-b2-mode-')
    await fs.outputFile(
      resolve(modeRoot, 'vite.config.ts'),
      'export default ({ mode }) => ({ base: "/" + mode + "/", build: { outDir: "out-" + mode } })\n',
    )
    await fs.outputFile(
      resolve(modeRoot, 'custom.vite.config.ts'),
      'export default { build: { outDir: "chosen-output" } }\n',
    )
    const resProd = await resolveEffectiveViteConfig(makeBaseOptions(modeRoot), 'build')
    expect(resProd.base).toBe('/production/')
    expect(resProd.outDir).toBe(resolve(modeRoot, 'out-production'))

    const resStaging = await resolveEffectiveViteConfig(makeBaseOptions(modeRoot), 'build', { mode: 'staging' })
    expect(resStaging.base).toBe('/staging/')
    expect(resStaging.outDir).toBe(resolve(modeRoot, 'out-staging'))

    const customConfigPath = resolve(modeRoot, 'custom.vite.config.ts')
    const resExplicitCfg = await resolveEffectiveViteConfig(makeBaseOptions(modeRoot), 'build', {
      configFile: customConfigPath,
    })
    expect(resExplicitCfg.outDir).toBe(resolve(modeRoot, 'chosen-output'))
    expect((resExplicitCfg.viteConfig.build as any).outDir).toBe(resolve(modeRoot, 'chosen-output'))
    expect(resExplicitCfg.viteConfig.configFile).toBe(false)

    // 6. Passing standard userRoot/vite.config.ts as explicit configFile does not duplicate plugins,
    //    preserves user-over-theme precedence, evaluates SSR per pass, and keeps client outDir on options.
    await fs.outputFile(
      resolve(modeRoot, 'vite.config.ts'),
      'export default ({ isSsrBuild }) => ({ define: { __SSR_TARGET__: JSON.stringify(isSsrBuild ? "server" : "client") }, build: { outDir: isSsrBuild ? "server-out" : "client-out" }, plugins: [{ name: isSsrBuild ? "ssr-plugin" : "client-plugin" }] })\n',
    )
    const stdConfigPath = resolve(modeRoot, 'vite.config.ts')
    const resStdExplicit = await resolveEffectiveViteConfig(makeBaseOptions(modeRoot), 'build', {
      configFile: stdConfigPath,
    })
    expect(resStdExplicit.viteConfig.configFile).toBe(false)
    expect((resStdExplicit.viteConfig.plugins || []).map((p: any) => p?.name)).toEqual(['client-plugin'])

    const ssgOptions = makeBaseOptions(modeRoot)
    await expect(runSsgBuild({ options: ssgOptions } as any)).rejects.toThrow()
    expect(viteMock.buildCalls).toHaveLength(2)
    expect(viteMock.buildCalls[0].define?.__SSR_TARGET__).toBe('"client"')
    expect(viteMock.buildCalls[1].define?.__SSR_TARGET__).toBe('"server"')
    expect(ssgOptions.outDir).toBe(resolve(modeRoot, 'client-out'))

    // 7. Cwd-relative explicit configFile resolves relative to cwd, user beats theme, and options.config.vite beats file base
    const workspaceRoot = await createProject('valaxy-b2-cwd-')
    const themeOverrideRoot = resolve(workspaceRoot, 'theme')
    const siteRoot = resolve(workspaceRoot, 'site')
    await fs.ensureDir(resolve(siteRoot, 'pages'))
    await fs.outputFile(resolve(themeOverrideRoot, 'vite.config.ts'), 'export default { base: "/theme/" }\n')
    await fs.outputFile(resolve(siteRoot, 'vite.config.ts'), 'export default { base: "/blog/", plugins: [{ name: "user-plugin" }] }\n')
    await fs.outputFile(
      resolve(siteRoot, 'custom.vite.ts'),
      'export default { base: "/file/", build: { outDir: "file-out" } }\n',
    )
    const prevCwd = process.cwd()
    process.chdir(workspaceRoot)
    try {
      const optUserBeatsTheme = makeBaseOptions(siteRoot, { themeRoot: themeOverrideRoot })
      const resUserBeatsTheme = await resolveEffectiveViteConfig(optUserBeatsTheme, 'build', {
        configFile: 'site/vite.config.ts',
      })
      expect(resUserBeatsTheme.base).toBe('/blog/')
      expect(optUserBeatsTheme.base).toBe('/blog/')
      expect(resUserBeatsTheme.viteConfig.base).toBe('/blog/')
      expect((resUserBeatsTheme.viteConfig.plugins || []).map((p: any) => p?.name)).toEqual(['user-plugin'])

      const optPrecedence = makeBaseOptions(siteRoot, {
        config: {
          siteConfig: { ...defaultSiteConfig },
          vite: { base: '/site/' },
        } as any,
      })
      const resCwd = await resolveEffectiveViteConfig(optPrecedence, 'build', {
        configFile: 'site/custom.vite.ts',
      })
      expect(resCwd.viteConfig.configFile).toBe(false)
      expect(resCwd.outDir).toBe(resolve(siteRoot, 'file-out'))
      expect(resCwd.base).toBe('/site/')
      expect(optPrecedence.base).toBe('/site/')
    }
    finally {
      process.chdir(prevCwd)
    }

    // 8. Discovers non-TypeScript Vite configs (e.g. vite.config.mjs) and rejects missing explicit configFile
    const mjsRoot = await createProject('valaxy-b2-mjs-')
    await fs.outputFile(
      resolve(mjsRoot, 'vite.config.mjs'),
      'export default { define: { __FROM_MJS_CONFIG__: true } }\n',
    )
    const resMjs = await resolveEffectiveViteConfig(makeBaseOptions(mjsRoot), 'build')
    expect(resMjs.viteConfig.define).toMatchObject({ __FROM_MJS_CONFIG__: true })

    await expect(
      resolveEffectiveViteConfig(makeBaseOptions(mjsRoot), 'build', {
        configFile: resolve(mjsRoot, 'missing.vite.ts'),
      }),
    ).rejects.toThrow()

    // 9. Respects configFile: false without evaluating discovered theme/user configs
    await fs.outputFile(
      resolve(mjsRoot, 'vite.config.mjs'),
      'throw new Error("should not load a disabled config"); export default {}\n',
    )
    const resDisabled = await resolveEffectiveViteConfig(makeBaseOptions(mjsRoot), 'build', {
      configFile: false,
    })
    expect(resDisabled.viteConfig.configFile).toBe(false)
  })

  it('preserves publicDir: false and resolves relative publicDir against userRoot in extendConfig', async () => {
    const userRoot = await createProject()
    const options = makeBaseOptions(userRoot, {
      publicDir: false,
      config: {
        siteConfig: { ...defaultSiteConfig },
        vite: { publicDir: false },
      } as any,
    })
    const plugin = createConfigPlugin(options)
    const configHook = (plugin as any).config as (cfg: any) => Promise<any>

    const disabledResult = await configHook({ publicDir: false })
    expect(disabledResult.publicDir).toBe(false)

    const relativeResult = await configHook({ publicDir: 'assets-pub' })
    expect(relativeResult.publicDir).toBe(resolve(userRoot, 'assets-pub'))
  })

  it('rejects parent-traversal files before reading in discoverPageFiles & llms build and maps root index.md to /index.md', async () => {
    const outer = await createProject('valaxy-b2-escape-')
    const userRoot = resolve(outer, 'blog')
    await fs.outputFile(resolve(outer, 'README.md'), '---\ntitle: SECRET OUTSIDE\n---\nTop secret outside content')
    await fs.outputFile(resolve(userRoot, 'pages/index.md'), '---\ntitle: Home\n---\nWelcome home')
    await fs.outputFile(resolve(userRoot, 'pages/index/index.md'), '---\ntitle: Index Subpage\n---\nSubpage body')
    await fs.outputFile(resolve(userRoot, 'pages/index/index/index.md'), '---\ntitle: Nested Index Subpage\n---\nDeep index body')
    await fs.outputFile(resolve(userRoot, 'pages/posts/hello.md'), '---\ntitle: Hello\n---\nPost body')

    const discovered = await discoverPageFiles(userRoot, ['**/*.md', '../README.md', '../../README.md'])
    expect([...discovered.keys()]).toEqual(['index.md', 'index/index.md', 'index/index/index.md', 'posts/hello.md'])

    const options = makeBaseOptions(userRoot, {
      outDir: resolve(userRoot, 'custom-out'),
      config: {
        siteConfig: {
          ...defaultSiteConfig,
          url: 'https://example.com/',
          llms: {
            ...defaultSiteConfig.llms,
            enable: true,
            files: true,
            fullText: true,
            include: ['**/*.md', '../README.md', '../../README.md'],
          },
        },
        vite: {},
      } as any,
    })

    await buildLlms(options)

    expect(await fs.pathExists(resolve(userRoot, 'custom-out/index.md'))).toBe(true)
    expect(await fs.pathExists(resolve(userRoot, 'custom-out/index/index.md'))).toBe(true)
    expect(await fs.pathExists(resolve(userRoot, 'custom-out/index/index/index.md'))).toBe(true)
    expect(await fs.readFile(resolve(userRoot, 'custom-out/index.md'), 'utf-8')).toContain('Welcome home')
    expect(await fs.readFile(resolve(userRoot, 'custom-out/index/index.md'), 'utf-8')).toContain('Subpage body')
    expect(await fs.readFile(resolve(userRoot, 'custom-out/index/index/index.md'), 'utf-8')).toContain('Deep index body')
    expect(await fs.pathExists(resolve(userRoot, 'custom-out/.md'))).toBe(false)
    const llmsTxt = await fs.readFile(resolve(userRoot, 'custom-out/llms.txt'), 'utf-8')
    expect(llmsTxt).toContain('(https://example.com/index.md)')
    expect(llmsTxt).toContain('(https://example.com/index/index.md)')
    expect(llmsTxt).toContain('(https://example.com/index/index/index.md)')
    expect(llmsTxt).not.toContain('SECRET OUTSIDE')
    expect(llmsTxt).not.toContain('(/.md)')
    const llmsFull = await fs.readFile(resolve(userRoot, 'custom-out/llms-full.txt'), 'utf-8')
    expect(llmsFull).not.toContain('Top secret outside content')
  })

  it('preserves addon and user plugins in SPA build()', async () => {
    const userRoot = await createProject('valaxy-b2-spa-')
    const customPlugin = { name: 'test-addon-plugin' }
    const options = makeBaseOptions(userRoot, {
      config: {
        siteConfig: { ...defaultSiteConfig },
        vite: {
          plugins: [customPlugin],
        },
        valaxy: {},
      } as any,
    })
    options.addons = []
    await runSpaBuild({ options } as any, { build: { outDir: 'spa-out' } })
    expect(viteMock.buildCalls).toHaveLength(1)
    const passedPlugins = (viteMock.buildCalls[0].plugins || []).flat(Infinity)
    expect(passedPlugins).toContain(customPlugin)
  })

  it('preserves Vite config injected by addon.setup() and options:resolved hooks during execBuild()', async () => {
    const userRoot = await createProject('valaxy-b2-execbuild-')
    await fs.outputFile(resolve(userRoot, 'pages/index.md'), '---\ntitle: Home\n---\nHello')
    await fs.outputFile(
      resolve(userRoot, 'valaxy.config.ts'),
      `export default {
  theme: 'yun',
  addons: [{
    name: 'test-setup-addon',
    setup(node) {
      node.options.config.vite = {
        ...node.options.config.vite,
        plugins: [...(node.options.config.vite?.plugins || []), { name: 'addon-setup-plugin' }],
        define: { ...node.options.config.vite?.define, __FROM_ADDON_SETUP__: JSON.stringify('ok') },
      }
      node.hook('options:resolved', () => {
        node.options.config.vite = {
          ...node.options.config.vite,
          plugins: [...(node.options.config.vite?.plugins || []), { name: 'options-resolved-plugin' }],
          define: { ...node.options.config.vite?.define, __FROM_OPTIONS_RESOLVED__: JSON.stringify('ok') },
        }
      })
    },
  }],
}
`,
    )

    await execBuild({ ssg: false, root: userRoot, output: 'addon-out', log: 'silent' })

    expect(viteMock.buildCalls).toHaveLength(1)
    const finalConfig = viteMock.buildCalls[0]
    const pluginNames = (finalConfig.plugins || []).flat(Infinity).map((p: any) => p?.name).filter(Boolean)
    expect(pluginNames).toContain('addon-setup-plugin')
    expect(pluginNames).toContain('options-resolved-plugin')
    expect(finalConfig.define).toMatchObject({
      __FROM_ADDON_SETUP__: '"ok"',
      __FROM_OPTIONS_RESOLVED__: '"ok"',
    })
    expect(finalConfig.build?.outDir).toBe(resolve(userRoot, 'addon-out'))
  })

  it('writes fuse index to nested outDir paths when publicDir is false and preserves URL/relative bases', async () => {
    const userRoot = await createProject()
    await fs.outputFile(resolve(userRoot, 'pages/index.md'), '---\ntitle: Root\n---\nRoot page')
    await fs.outputFile(resolve(userRoot, 'pages/posts/alpha.md'), '---\ntitle: Alpha\n---\nAlpha body')

    const options = makeBaseOptions(userRoot, {
      outDir: resolve(userRoot, 'out-fuse'),
      publicDir: false,
      base: 'https://example.com/blog/',
    })

    await execFuse(options)

    expect(await fs.pathExists(resolve(userRoot, 'public'))).toBe(false)
    const distFuse = await fs.readJson(resolve(userRoot, 'out-fuse/search/index.json'))
    expect(distFuse.map((entry: any) => entry.link)).toEqual([
      'https://example.com/blog/',
      'https://example.com/blog/posts/alpha',
    ])

    expect(joinBaseUrl('//cdn.example.com/blog/', 'posts/a')).toBe('//cdn.example.com/blog/posts/a')
    expect(joinBaseUrl('./', 'posts/a')).toBe('./posts/a')
    expect(joinBaseUrl('/blog/', '')).toBe('/blog/')
    expect(joinBaseUrl('/', '')).toBe('/')
  })
})
