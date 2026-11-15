import type { ResolvedValaxyOptions } from '../../packages/valaxy/node/types'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import fs from 'fs-extra'
import { afterEach, describe, expect, it } from 'vitest'
import { defaultSiteConfig } from '../../packages/valaxy/node/config/site'
import { execFuse } from '../../packages/valaxy/node/modules/fuse'
import { build as buildLlms } from '../../packages/valaxy/node/modules/llms/utils'
import { createConfigPlugin } from '../../packages/valaxy/node/plugins/extendConfig'
import { resolveEffectiveViteConfig } from '../../packages/valaxy/node/utils/buildConfig'
import { discoverPageFiles } from '../../packages/valaxy/node/utils/pageSources'
import { joinBaseUrl } from '../../packages/valaxy/shared/utils/uri'

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
  await Promise.all(tempRoots.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
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
    await fs.outputFile(resolve(userRoot, 'pages/posts/hello.md'), '---\ntitle: Hello\n---\nPost body')

    const discovered = await discoverPageFiles(userRoot, ['**/*.md', '../README.md', '../../README.md'])
    expect([...discovered.keys()]).toEqual(['index.md', 'posts/hello.md'])

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
    expect(await fs.pathExists(resolve(userRoot, 'custom-out/.md'))).toBe(false)
    const llmsTxt = await fs.readFile(resolve(userRoot, 'custom-out/llms.txt'), 'utf-8')
    expect(llmsTxt).toContain('/index.md')
    expect(llmsTxt).not.toContain('SECRET OUTSIDE')
    expect(llmsTxt).not.toContain('(/.md)')
    const llmsFull = await fs.readFile(resolve(userRoot, 'custom-out/llms-full.txt'), 'utf-8')
    expect(llmsFull).not.toContain('Top secret outside content')
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
