import type { ValaxyNode } from '../packages/valaxy/node/types'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import fs from 'fs-extra'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadAllContent } from '../packages/valaxy/node/modules/content'
import { filePathToUrlPath, scanPageFiles } from '../packages/valaxy/node/modules/utils'
import { createScanDeadLinks } from '../packages/valaxy/node/plugins/markdown/transform/dead-links'
import { discoverPageFiles, resolvePageFile } from '../packages/valaxy/node/utils/pageSources'

const roots: string[] = []
async function fixture() {
  const userRoot = await mkdtemp(resolve(tmpdir(), 'valaxy-generated-'))
  roots.push(userRoot)
  await fs.outputFile(resolve(userRoot, 'pages/api/index.md'), '# API')
  const node = { options: { userRoot, pages: ['api/index.md'], config: { build: {}, vite: {} } } } as unknown as ValaxyNode
  return { node, cacheDir: resolve(userRoot, '.valaxy/content'), mode: 'build' as const }
}
afterEach(async () => {
  vi.restoreAllMocks()
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

describe('generated page consumers', () => {
  it('discovers new pages on a cold load and resolves links across content roots', async () => {
    const ctx = await fixture()
    await loadAllContent([{ name: 'api', strict: true, load: () => [
      { path: 'api/functions/read.md', content: '# read\n\n[API](../index.md)' },
    ] }], ctx)
    expect(ctx.node.options.pages).toContain('api/functions/read.md')
    const file = resolvePageFile('api/functions/read.md', ctx.node.options.userRoot)!
    expect(await scanPageFiles(ctx.node.options.userRoot, ['api/**/*.md'])).toContain(file)
    expect(filePathToUrlPath(file, ctx.node.options.userRoot)).toBe('/api/functions/read')
    expect(createScanDeadLinks(ctx.node.options)('', { id: file, fileInfo: { links: ['../index.md'] } } as any)).toEqual([])
    expect(resolvePageFile('../secret.md', ctx.node.options.userRoot)).toBeUndefined()
  })

  it('preserves the previous complete output when a strict transform fails', async () => {
    const ctx = await fixture()
    const first = [{ path: 'api/a.md', content: 'previous' }, { path: 'api/b.md', content: 'keep' }]
    await loadAllContent([{ name: 'api', strict: true, load: () => first }], ctx)
    const invalid = { name: 'api', strict: true, load: () => [{ path: 'api/a.md', content: 'changed' }, { path: '../bad.md', content: 'bad' }] }
    await expect(loadAllContent([invalid], ctx)).rejects.toThrow('Invalid content path')
    expect(await readFile(resolve(ctx.cacheDir, 'pages/api/a.md'), 'utf8')).toBe('previous')
    await expect(loadAllContent([invalid], { ...ctx, mode: 'dev' })).resolves.toBeUndefined()
    expect((await discoverPageFiles(ctx.node.options.userRoot)).has('api/b.md')).toBe(true)
  })

  it('rejects user/loader collisions and removes deleted pages from the inventory', async () => {
    const ctx = await fixture()
    await expect(loadAllContent([{ name: 'api', strict: true, load: () => [{ path: 'api/index.md', content: 'overwrite' }] }], ctx)).rejects.toThrow('conflicts')
    await loadAllContent([{ name: 'api', strict: true, load: () => [{ path: 'api/removed.md', content: '# Removed' }] }], ctx)
    await loadAllContent([{ name: 'api', strict: true, load: () => [] }], ctx)
    expect(ctx.node.options.pages).not.toContain('api/removed.md')
  })

  it('rolls back the complete batch on a partial filesystem failure', async () => {
    const ctx = await fixture()
    const loader = { name: 'api', strict: true, load: () => [{ path: 'api/a.md', content: 'before' }, { path: 'api/b.md', content: 'before' }] }
    await loadAllContent([loader], ctx)
    const rename = fs.renameSync.bind(fs)
    vi.spyOn(fs, 'renameSync').mockImplementation((from, to) => {
      if (String(to).endsWith('/api/b.md'))
        throw new Error('simulated disk failure')
      return rename(from, to)
    })
    loader.load = () => [{ path: 'api/a.md', content: 'after' }, { path: 'api/b.md', content: 'after' }]
    await expect(loadAllContent([loader], ctx)).rejects.toThrow('simulated disk failure')
    expect(await readFile(resolve(ctx.cacheDir, 'pages/api/a.md'), 'utf8')).toBe('before')
    expect(await readFile(resolve(ctx.cacheDir, 'pages/api/b.md'), 'utf8')).toBe('before')
  })
})
