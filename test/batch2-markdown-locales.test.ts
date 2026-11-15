import type { ResolvedValaxyOptions } from '../packages/valaxy/node/types'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import fs from 'fs-extra'
import { afterEach, describe, expect, it } from 'vitest'
import { createMarkdownRenderer } from '../packages/valaxy/node/plugins/markdown'
import { createScanDeadLinks } from '../packages/valaxy/node/plugins/markdown/transform/dead-links'
import { toAtFS } from '../packages/valaxy/node/utils'
import { templateLocales } from '../packages/valaxy/node/virtual/locales'

const tempRoots: string[] = []

async function createTempRoot() {
  const dir = await mkdtemp(resolve(tmpdir(), 'valaxy-batch2-md-'))
  tempRoots.push(dir)
  return dir
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
})

describe('batch 2 markdown & locale safety', () => {
  it('renders snippet fallback messages cleanly on missing, directory, and ENOTDIR paths', async () => {
    const userRoot = await createTempRoot()
    await fs.outputFile(resolve(userRoot, 'package.json'), '{"name":"test"}\n')
    await fs.ensureDir(resolve(userRoot, 'snippets'))
    const docPath = resolve(userRoot, 'pages/posts/test.md')
    await fs.ensureFile(docPath)

    const md = await createMarkdownRenderer()

    const missingHtml = await md.renderAsync('<<< ../../does-not-exist.ts', { id: docPath, path: docPath })
    expect(missingHtml).toContain('Code snippet path not found:')

    const dirHtml = await md.renderAsync('<<< ../../snippets', { id: docPath, path: docPath })
    expect(dirHtml).toContain('Invalid code snippet option')

    // Parent path segment is a file ("package.json"), triggering ENOTDIR in Node 22 statSync
    const enotdirHtml = await md.renderAsync('<<< ../../package.json/child.ts', { id: docPath, path: docPath })
    expect(enotdirHtml).toContain('Code snippet path not found:')
  }, 15000)

  it('preserves $&, $$, and $\' literally inside non-v-pre -vue code fences', async () => {
    const md = await createMarkdownRenderer()
    const source = [
      '```ts-vue',
      'const pattern = "{{ $& }} {{ $$ }} {{ $\' }}"',
      '```',
    ].join('\n')

    const html = await md.renderAsync(source)
    expect(html).toContain('{{ $& }}')
    expect(html).toContain('{{ $$ }}')
    expect(html).toContain('{{ $\' }}')
    expect(html).not.toContain('V_AMP')
  }, 15000)

  it('survives malformed URIs in imagePlugin, linkPlugin, and dead-links without throwing', async () => {
    const userRoot = await createTempRoot()
    await fs.outputFile(resolve(userRoot, 'custom-public/static.html'), '<h1>ok</h1>')
    const nestedFile = resolve(userRoot, 'pages/posts/nested/article.md')
    await fs.outputFile(nestedFile, '# Article')

    const md = await createMarkdownRenderer()
    const env: any = { id: nestedFile, path: nestedFile }
    const html = await md.renderAsync([
      '![bad1](./img%ZZ.png)',
      '![bad2](/bad%FF.png)',
      '[broken-uri](/bad%FF)',
      '[truncated-utf8](/bad%E0%A4)',
      '[bad-url](http://[invalid)',
      '[public-page](/static.html)',
    ].join('\n\n'), env)

    expect(html).toContain('%ZZ.png')
    expect(html).toContain('/bad%FF.png')
    expect(html).toContain('/bad%E0%A4')

    const options = {
      userRoot,
      pages: ['posts/nested/article.md'],
      config: {
        build: { ignoreDeadLinks: false },
        vite: { publicDir: 'custom-public' },
      },
    } as unknown as ResolvedValaxyOptions

    const scan = createScanDeadLinks(options)
    const deadLinks = scan('', { id: nestedFile, fileInfo: { links: ['/static.html', '/bad%FF', '/bad%E0%A4', 'http://[invalid', '/missing'] } } as any)

    expect(deadLinks.map(item => item.url)).toEqual(['/bad%FF', '/bad%E0%A4', '/missing'])

    const disabledPublicScan = createScanDeadLinks({
      ...options,
      publicDir: false,
      config: { build: { ignoreDeadLinks: false }, vite: { publicDir: false } },
    } as unknown as ResolvedValaxyOptions)

    expect(() => disabledPublicScan('', { id: nestedFile, fileInfo: { links: ['/static.html'] } } as any)).not.toThrow()
    expect(disabledPublicScan('', { id: nestedFile, fileInfo: { links: ['/static.html'] } } as any)).toEqual([{ url: '/static', file: 'posts/nested/article.md' }])
  }, 15000)

  it('generates collision-free virtual locale identifiers for hyphenated, underscored, and multi-segment tags', async () => {
    const root1 = await createTempRoot()
    const root2 = await createTempRoot()
    for (const lang of ['en-US', 'en_US', 'zh-Hans-CN'])
      await fs.outputFile(resolve(root1, `locales/${lang}.yml`), `greeting: ${lang}\n`)
    await fs.outputFile(resolve(root2, 'locales/zh-Hans-CN.yml'), 'greeting: override\n')

    const code = await templateLocales.getContent({
      roots: [root1, root2],
      config: {
        siteConfig: {
          languages: ['en-US', 'en_US', 'zh-Hans-CN', 'en-US'],
        },
      },
    } as any)

    const importLines = code.split('\n').filter(line => line.startsWith('import '))
    expect(importLines).toHaveLength(5) // 3 from root1 (deduped) + 1 from root2 + defu
    expect(code).toContain('import locale_0_0 from')
    expect(code).toContain('import locale_0_1 from')
    expect(code).toContain('import locale_0_2 from')
    expect(code).toContain('import locale_1_2 from')
    expect(code).toContain('messages["zh-Hans-CN"]')

    // Evaluate generated ESM by pointing locale imports at real temporary JS modules
    const localeDataUrl = (greeting: string) =>
      `data:text/javascript,export default ${JSON.stringify({ greeting })}`
    const runnableCode = code
      .replace('from "defu"', 'from "data:text/javascript,export const createDefu = () => (src, dst) => ({ ...dst, ...src })"')
      .replace(`"${toAtFS(resolve(root1, 'locales/en-US.yml'))}"`, JSON.stringify(localeDataUrl('en-US')))
      .replace(`"${toAtFS(resolve(root1, 'locales/en_US.yml'))}"`, JSON.stringify(localeDataUrl('en_US')))
      .replace(`"${toAtFS(resolve(root1, 'locales/zh-Hans-CN.yml'))}"`, JSON.stringify(localeDataUrl('zh-Hans-CN')))
      .replace(`"${toAtFS(resolve(root2, 'locales/zh-Hans-CN.yml'))}"`, JSON.stringify(localeDataUrl('override')))

    const mjsPath = resolve(root1, 'locales-eval.mjs')
    await fs.outputFile(mjsPath, runnableCode)
    const mod = await import(pathToFileURL(mjsPath).href)
    const evaluated = mod.default

    expect(evaluated['en-US']).toEqual({ greeting: 'en-US' })
    expect(evaluated.en_US).toEqual({ greeting: 'en_US' })
    expect(evaluated['zh-Hans-CN']).toEqual({ greeting: 'override' })
  })
})
