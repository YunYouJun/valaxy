import type { DevframeNodeContext } from 'devframe'
import { mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHostContext } from 'devframe/node'
import fs from 'fs-extra'
import matter from 'gray-matter'
import { createServer } from 'vite'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createValaxyDevframe } from '../../packages/devtools/src/node/definition'
import { watchResources } from '../../packages/devtools/src/node/watch'
import { resolveDevtoolsBase } from '../../packages/devtools/src/shared/constants'
import { RESOURCES_STATE } from '../../packages/devtools/src/shared/state'

let root: string
let site: string
let ctx: DevframeNodeContext

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'valaxy-devtools-test-'))
  site = join(root, 'site')
  await fs.ensureDir(join(site, 'pages/posts'))
  await writeFile(join(site, 'pages/posts/hello.md'), '---\ntitle: Hello\ndate: 2026-01-01\nlegacy: value\ntags: [one]\n---\n\nBody stays intact.\n')
  ctx = await createHostContext({
    cwd: site,
    mode: 'dev',
    host: {
      mountStatic() {},
      mountConnectionMeta() {},
      resolveOrigin: () => 'http://localhost:5173',
      getStorageDir: scope => join(root, 'state', scope),
    },
  })
  await createValaxyDevframe({ userRoot: site, siteUrl: () => 'http://localhost:5173/blog/' }).setup?.(ctx, { flags: {} })
})

afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

describe('valaxy Devframe RPC', () => {
  it('reads actual Markdown, preserves dates, and resolves the site URL', async () => {
    expect(await ctx.rpc.invokeLocal('valaxy:get-options')).toEqual({ userRoot: site, siteUrl: 'http://localhost:5173/blog/' })
    const page = await ctx.rpc.invokeLocal('valaxy:get-page-data', '/pages/posts/hello.md')
    expect(page).toMatchObject({ routePath: '/posts/hello', frontmatter: { title: 'Hello', date: new Date('2026-01-01T00:00:00.000Z') } })
    expect((await ctx.rpc.invokeLocal('valaxy:get-post-list')).posts).toEqual([page])
  })

  it('creates Chinese posts, chooses unique names, and rejects malformed RPC input', async () => {
    const first = await ctx.rpc.invokeLocal('valaxy:create-post', { title: '你好 Valaxy', tags: ['blog'] })
    const second = await ctx.rpc.invokeLocal('valaxy:create-post', { title: '你好 Valaxy' })
    expect(first.filePath).toBe(join(site, 'pages/posts/你好-valaxy.md'))
    expect(second.filePath).toBe(join(site, 'pages/posts/你好-valaxy-1.md'))
    expect(matter(await readFile(first.filePath!, 'utf8')).data).toMatchObject({ draft: true, tags: ['blog'] })
    const concurrent = await Promise.all([
      ctx.rpc.invokeLocal('valaxy:create-post', { title: 'Concurrent' }),
      ctx.rpc.invokeLocal('valaxy:create-post', { title: 'Concurrent' }),
    ])
    expect(concurrent.every(result => result.success)).toBe(true)
    expect(new Set(concurrent.map(result => result.filePath)).size).toBe(2)
    await expect(ctx.rpc.invokeLocal('valaxy:create-post', { title: '' })).rejects.toThrow()
    // @ts-expect-error exercise the runtime schema across the RPC boundary
    await expect(ctx.rpc.invokeLocal('valaxy:batch-update-frontmatter', [first.filePath!], [{ type: 'rename', key: 'title' }])).rejects.toThrow()
  })

  it('saves, batch edits and migrates frontmatter while keeping Markdown content', async () => {
    const file = join(site, 'pages/posts/hello.md')
    await ctx.rpc.invokeLocal('valaxy:update-frontmatter', { filePath: file, frontmatter: { title: 'Changed', legacy: 'value', tags: ['two'] } })
    const result = await ctx.rpc.invokeLocal('valaxy:batch-update-frontmatter', [file, join(site, 'pages/posts/missing.md')], [
      { type: 'rename', key: 'legacy', newKey: 'custom' },
      { type: 'set', key: 'draft', value: false },
      { type: 'delete', key: 'tags' },
    ])
    expect(result).toMatchObject({ total: 2, updated: 1, errors: [{ filePath: join(site, 'pages/posts/missing.md') }] })
    await ctx.rpc.invokeLocal('valaxy:run-migration', [file], { custom: 'migrated' })
    const parsed = matter(await readFile(file, 'utf8'))
    expect(parsed.data).toEqual({ title: 'Changed', migrated: 'value', draft: false })
    expect(parsed.content).toBe('\nBody stays intact.\n')
  })

  it('reads collection ordering including link-only entries', async () => {
    const dir = join(site, 'pages/collections/course')
    await fs.ensureDir(dir)
    await writeFile(join(dir, 'index.ts'), 'export default { title: \'Course\', items: [{ link: \'https://valaxy.site\', title: \'Docs\' }, { key: \'second\' }, { key: \'first\' }] }')
    await writeFile(join(dir, 'first.md'), '---\ntitle: First\n---\n')
    await writeFile(join(dir, 'second.md'), '---\ntitle: Second\n---\n')
    const [collection] = await ctx.rpc.invokeLocal('valaxy:get-collection-list')
    expect(collection.title).toBe('Course')
    expect(collection.items.map(item => item.title)).toEqual(['Docs', 'Second', 'First'])
  })

  it('creates and edits source config fields without erasing expressions', async () => {
    expect(await ctx.rpc.invokeLocal('valaxy:update-config-field', 'site', 'author.name', 'Valaxy')).toEqual({ success: true })
    await writeFile(join(site, 'valaxy.config.ts'), 'export default defineValaxyConfig({ theme: \'yun\', themeConfig: { label: $t(\'hello\'), count: 1 } })')
    expect(await ctx.rpc.invokeLocal('valaxy:update-config-field', 'theme', 'count', 2)).toEqual({ success: true })
    expect(await readFile(join(site, 'valaxy.config.ts'), 'utf8')).toContain('$t(\'hello\')')
    const configs = await ctx.rpc.invokeLocal('valaxy:get-config')
    expect(configs.siteConfig.author.name).toBe('Valaxy')
    expect(configs.themeConfig).toEqual({ label: '$t(\'hello\')', count: 2 })
    expect(await ctx.rpc.invokeLocal('valaxy:update-config-field', 'site', '__proto__.bad', true)).toMatchObject({ success: false })
  })

  it('rejects traversal, symlink escapes, dangling links and non-Markdown writes', async () => {
    const outside = join(root, 'outside.md')
    await writeFile(outside, 'untouched')
    await symlink(outside, join(site, 'pages/posts/link.md'))
    await symlink(join(root, 'missing.md'), join(site, 'pages/posts/dangling.md'))
    for (const file of ['../outside.md', outside, 'pages/posts/link.md', 'pages/posts/dangling.md', 'site.config.ts']) {
      await expect(ctx.rpc.invokeLocal('valaxy:update-frontmatter', { filePath: file, frontmatter: {} })).rejects.toThrow()
      await expect(ctx.rpc.invokeLocal('valaxy:run-migration', [file], { title: 'name' })).rejects.toThrow()
    }
    expect(await ctx.rpc.invokeLocal('valaxy:create-post', { title: 'Escape', path: '../../../outside' })).toMatchObject({ success: false })
    await expect(ctx.rpc.invokeLocal('valaxy:open-in-editor', { file: outside })).rejects.toThrow()
    await symlink(outside, join(site, 'site.config.ts'))
    expect(await ctx.rpc.invokeLocal('valaxy:update-config-field', 'site', 'title', 'Oops')).toMatchObject({ success: false })
    await symlink(join(root, 'new-outside.md'), join(site, 'pages/posts/hello-1.md'))
    expect(await ctx.rpc.invokeLocal('valaxy:create-post', { title: 'Hello' })).toMatchObject({ success: true, filePath: join(site, 'pages/posts/hello-2.md') })
    expect(await fs.pathExists(join(root, 'new-outside.md'))).toBe(false)
    expect(await readFile(outside, 'utf8')).toBe('untouched')
  })

  it('invalidates resources after external edits and releases watcher listeners', async () => {
    const server = await createServer({
      root: site,
      configFile: false,
      devtools: false,
      // Poll the temporary fixture so rapid writes do not depend on OS event batching.
      server: { middlewareMode: true, watch: { usePolling: true, interval: 20 } },
      logLevel: 'silent',
    })
    const listeners = server.watcher.listenerCount('all')
    const stop = await watchResources(server, ctx, { userRoot: site })
    try {
      const state = await ctx.rpc.sharedState.get<{ revision: number }>(RESOURCES_STATE)
      const before = state.value().revision
      // Wait for the initial scan so the new file is observed as an external change.
      await expect.poll(() => Object.values(server.watcher.getWatched()).some(files => files.includes('hello.md')), { timeout: 5000 }).toBe(true)
      await writeFile(join(site, 'pages/posts/external.md'), '---\ntitle: External\n---\n')
      await expect.poll(() => state.value().revision, { timeout: 5000 }).toBeGreaterThan(before)
      stop()
      expect(server.watcher.listenerCount('all')).toBe(listeners)
    }
    finally {
      stop()
      await server.close()
    }
  })

  it('normalizes root and nested mount paths', () => {
    expect(resolveDevtoolsBase('/')).toBe('/__valaxy_devtools__/')
    expect(resolveDevtoolsBase('/blog/')).toBe('/blog/__valaxy_devtools__/')
    expect(resolveDevtoolsBase('/blog')).toBe('/blog/__valaxy_devtools__/')
  })
})
