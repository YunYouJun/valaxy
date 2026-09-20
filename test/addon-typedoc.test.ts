import type { ValaxyNode } from '../packages/valaxy/node/types'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import fs from 'fs-extra'
import { expect, it } from 'vitest'
import { resolveSymbolAnchors } from '../packages/valaxy-addon-typedoc/node/links'
import { createTypeDocLoader } from '../packages/valaxy-addon-typedoc/node/loader'

it('resolves inherited symbol anchors while preserving examples and prose links', () => {
  const anchors = new Map([['/api/Base.md', new Set(['api-medium_zoom', 'api-description'])]])
  expect(resolveSymbolAnchors('[zoom](/api/Base.md#medium_zoom) [description](/api/Base.md#description)', anchors))
    .toBe('[zoom](/api/Base.md#api-medium_zoom) [description](/api/Base.md#api-description)')
  const example = '```md\n[zoom](/api/Base.md#medium_zoom)\n```\n`[zoom](/api/Base.md#medium_zoom)`'
  expect(resolveSymbolAnchors(example, anchors)).toBe(example)
  expect(resolveSymbolAnchors('[Other](/guide.md#medium_zoom)', anchors)).toBe('[Other](/guide.md#medium_zoom)')
})

it('generates real references, caches unchanged sources and invalidates edited dependencies', async () => {
  const root = await mkdtemp(resolve(tmpdir(), 'valaxy-typedoc-'))
  try {
    await fs.outputFile(resolve(root, 'src/index.ts'), '/** Read a value. */\nexport function read<T>(value: T): T { return value }\nexport interface Base { medium_zoom: boolean }\nexport interface Derived extends Base {}\nexport namespace Helpers { export type Result<T> = { value: T } }')
    await fs.writeJson(resolve(root, 'compiler-settings.json'), { compilerOptions: { target: 'ESNext', types: [], strict: true } })
    await fs.writeJson(resolve(root, 'tsconfig.json'), { extends: './compiler-settings.json', include: ['src'] })
    await fs.writeJson(resolve(root, 'typedoc.json'), { entryPoints: ['./src/index.ts'], tsconfig: './tsconfig.json' })
    const node = { options: { userRoot: root, config: { themeConfig: { sidebar: { '/guide/': [] } } } } } as unknown as ValaxyNode
    const ctx = { node, mode: 'build' as const, cacheDir: resolve(root, '.valaxy/content') }
    const loader = createTypeDocLoader({ options: './typedoc.json', watch: ['src/**/*.ts'] }, root)
    const first = await loader.load(ctx)
    expect(first.some(page => page.path === 'api/functions/read.md' && page.content.includes('Read a value.'))).toBe(true)
    expect(await loader.load(ctx)).toEqual(first)
    expect(loader.generationCount()).toBe(1)
    expect(loader.isSource(resolve(root, 'src/new.ts'))).toBe(true)
    expect(loader.isSource(resolve(root, 'pages/guide.md'))).toBe(false)
    expect(loader.isSource(resolve(root, '.valaxy/content/cache.json'))).toBe(false)
    expect(first.find(page => page.path === 'api/interfaces/Derived.md')?.content).toContain('/api/interfaces/Base.md#api-medium_zoom')
    expect(first.some(page => page.path.includes('Helpers'))).toBe(true)
    await fs.writeJson(resolve(root, 'compiler-settings.json'), { compilerOptions: { target: 'ES2022', types: [], strict: true } })
    await loader.load(ctx)
    expect(loader.generationCount()).toBe(2)
    await fs.writeFile(resolve(root, 'src/index.ts'), '/** Write a value. */\nexport function write(value: string) { return value }')
    const changed = await loader.load(ctx)
    expect(changed.some(page => page.path === 'api/functions/write.md')).toBe(true)
    expect(changed.some(page => page.path === 'api/functions/read.md')).toBe(false)
    expect(loader.generationCount()).toBe(3)
    await loader.onLoaded?.(ctx)
    expect(node.options.config.themeConfig).toHaveProperty('sidebar./api/')
    expect(node.options.config.themeConfig).toHaveProperty('sidebar./guide/')
    await fs.writeFile(resolve(root, 'src/index.ts'), 'export const invalid: number = "not a number"')
    await expect(loader.load(ctx)).rejects.toThrow('conversion failed')
  }
  finally { await rm(root, { recursive: true, force: true }) }
}, 30000)
