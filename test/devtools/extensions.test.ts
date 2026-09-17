import type { DevframeNodeContext } from 'devframe'
import type { ValaxyDevtoolsPlugin } from '../../packages/devtools/src/plugin'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHostContext } from 'devframe/node'
import fs from 'fs-extra'
import matter from 'gray-matter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createValaxyDevframe } from '../../packages/devtools/src/node/definition'
import { defineValaxyDevtoolsPlugin } from '../../packages/devtools/src/plugin'
import { parseAddons } from '../../packages/valaxy/node/utils/addons'

let root: string
let file: string
let ctx: DevframeNodeContext
const definitions: ReturnType<typeof createValaxyDevframe>[] = []
const mounts = vi.fn()
const discovery = vi.fn()

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'valaxy-extension-test-'))
  file = join(root, 'pages/posts/hello.md')
  await fs.ensureDir(join(root, 'pages/posts'))
  await fs.ensureDir(join(root, 'client'))
  await writeFile(join(root, 'client/index.html'), '<title>SEO panel</title>')
  await writeFile(file, '---\ntitle: Hello\nlegacy: abc\n---\n\nKeep the body.\n')
  mounts.mockClear()
  discovery.mockClear()
  ctx = await createHostContext({
    cwd: root,
    mode: 'dev',
    host: { mountStatic: mounts, mountConnectionMeta: discovery, resolveOrigin: () => 'http://localhost:5173', getStorageDir: scope => join(root, 'state', scope) },
  })
})

afterEach(async () => {
  await Promise.all(definitions.splice(0).map(definition => definition.dispose()))
  await rm(root, { force: true, recursive: true })
})

function example(): ValaxyDevtoolsPlugin {
  return defineValaxyDevtoolsPlugin({
    apiVersion: 1,
    id: 'seo',
    name: 'SEO',
    panels: [{ id: 'overview', title: 'SEO Overview', clientAssets: join(root, 'client') }],
    editor: {
      fields: [
        { key: 'description', label: 'Description', type: 'textarea', maxLength: 40 },
        { key: 'priority', label: 'Priority', type: 'number', min: 0, max: 1 },
        { key: 'reviewed', label: 'Reviewed', type: 'boolean' },
        { key: 'review', label: 'Review', type: 'select', options: [{ label: 'Done', value: 'done' }] },
      ],
      actions: [{ id: 'check', label: 'Check', run: ({ draft, page }) => ({ message: `${page.frontmatter.title}: ${draft.description}`, severity: 'info' }) }],
    },
  })
}

async function start(plugins: NonNullable<Parameters<typeof createValaxyDevframe>[0]>['plugins']) {
  const definition = createValaxyDevframe({ userRoot: root, base: '/blog/', plugins })
  definitions.push(definition)
  await definition.setup(ctx)
  return definition
}

describe('addon DevTools extensions', () => {
  it('loads enabled addon modules lazily and publishes only their serializable contributions', async () => {
    const loader = vi.fn(async () => ({ default: example() }))
    const disabled = vi.fn(async () => example())
    for (const name of ['enabled', 'disabled']) {
      await fs.ensureDir(join(root, name))
      await writeFile(join(root, name, 'package.json'), JSON.stringify({ name: `valaxy-addon-${name}`, version: '0.0.0' }))
    }
    const addons = await parseAddons([{ name: './enabled', devtools: loader }, { name: './disabled', enable: false, devtools: disabled }], root)
    expect(loader).not.toHaveBeenCalled()
    await start(addons.map(addon => async () => addon.devtools!({ userRoot: root, addonRoot: addon.root, options: addon.options })))
    expect(loader).toHaveBeenCalledOnce()
    expect(disabled).not.toHaveBeenCalled()
    const manifest = await ctx.rpc.invokeLocal('valaxy:get-extensions')
    expect(manifest.plugins).toHaveLength(1)
    expect(manifest.plugins[0].panels[0]).toMatchObject({ id: 'valaxy:addon:seo:overview', url: '/blog/__valaxy_addons__/seo/overview/' })
    expect(JSON.stringify(manifest)).not.toContain(root)
    expect(manifest.plugins[0].actions).toEqual([{ id: 'seo:check', label: 'Check' }])
    expect(discovery).toHaveBeenCalledWith('/blog/__valaxy_addons__/seo/overview/')
    expect(mounts).toHaveBeenCalledWith('/blog/__valaxy_addons__/seo/overview/', join(root, 'client'))
  })

  it('shares content reads and disposes change subscriptions and addon resources once', async () => {
    const changed = vi.fn()
    const cleanup = vi.fn()
    const plugin = example()
    plugin.setup = async ({ data, onDispose }) => {
      const list = await data.getPostList()
      expect(await data.getPageData(list.posts[0].filePath)).toMatchObject({ frontmatter: { title: 'Hello' } })
      expect(await data.getConfig()).toMatchObject({ siteConfigExists: false })
      await data.onChanged(changed)
      onDispose(cleanup)
    }
    const definition = await start([plugin])
    const state = await ctx.rpc.sharedState.get('valaxy:resources')
    state.mutate((value) => {
      value.revision++
    })
    expect(changed).toHaveBeenCalledOnce()
    await definition.dispose()
    state.mutate((value) => {
      value.revision++
    })
    expect(changed).toHaveBeenCalledOnce()
    await definition.dispose()
    expect(cleanup).toHaveBeenCalledOnce()
  })

  it('checks unsaved drafts without changing files and rejects unknown actions and outside pages', async () => {
    await start([example()])
    const before = await readFile(file, 'utf8')
    const result = await ctx.rpc.invokeLocal('valaxy:run-editor-action', 'seo:check', file, { description: 'Unsaved' })
    expect(result.message).toBe('Hello: Unsaved')
    expect(await readFile(file, 'utf8')).toBe(before)
    await expect(ctx.rpc.invokeLocal('valaxy:run-editor-action', 'seo:missing', file, {})).rejects.toThrow('Unknown editor action')
    await expect(ctx.rpc.invokeLocal('valaxy:run-editor-action', 'seo:check', '../outside.md', {})).rejects.toThrow()
  })

  it('validates addon fields on save, batch editing, and migration without adding absent fields', async () => {
    await start([example()])
    const save = (frontmatter: Record<string, unknown>) => ctx.rpc.invokeLocal('valaxy:update-frontmatter', { filePath: file, frontmatter })
    await save({ title: 'Updated', description: 'Valid', priority: 0.5, reviewed: false, review: 'done' })
    for (const invalid of [{ description: 123 }, { description: 'x'.repeat(41) }, { priority: 2 }, { reviewed: 'false' }, { review: 'unknown' }])
      await expect(save(invalid)).rejects.toThrow('invalid value')
    expect(matter(await readFile(file, 'utf8')).data.title).toBe('Updated')
    const batch = await ctx.rpc.invokeLocal('valaxy:batch-update-frontmatter', [file], [{ type: 'set', key: 'priority', value: -1 }])
    expect(batch).toMatchObject({ updated: 0, errors: [{ filePath: file }] })
    await expect(ctx.rpc.invokeLocal('valaxy:run-migration', [file], { description: 'priority' })).rejects.toThrow('invalid value')
    await save({ title: 'No optional fields' })
    const final = matter(await readFile(file, 'utf8'))
    expect(final.data).toEqual({ title: 'No optional fields' })
    expect(final.content).toBe('\nKeep the body.\n')
  })

  it('rejects conflicting IDs, core fields, invalid schemas, and missing panel assets before setup', async () => {
    const setup = vi.fn()
    const base = example()
    base.setup = setup
    const cases: ValaxyDevtoolsPlugin[][] = [
      [base, base],
      [base, { ...base, id: 'another' }],
      [{ ...base, editor: { fields: [{ key: 'title', label: 'Override', type: 'text' }] } }],
      [{ ...base, editor: { fields: [{ key: '__proto__', label: 'Unsafe', type: 'text' }] } }],
      [{ ...base, editor: { fields: [{ key: 'priority', label: 'Priority', type: 'number', min: 2, max: 1 }] } }],
      [{ ...base, panels: [{ id: 'overview', title: 'Missing', clientAssets: join(root, 'missing') }] }],
    ]
    for (const plugins of cases)
      await expect(start(plugins)).rejects.toThrow()
    expect(setup).not.toHaveBeenCalled()
    expect(mounts).not.toHaveBeenCalled()
  })

  it('cleans up partial setup if a later addon fails', async () => {
    const cleanup = vi.fn()
    await expect(start([
      { apiVersion: 1, id: 'one', name: 'One', setup: ({ onDispose }) => onDispose(cleanup) },
      { apiVersion: 1, id: 'two', name: 'Two', setup: () => {
        throw new Error('Failed setup')
      } },
    ])).rejects.toThrow('Failed setup')
    expect(cleanup).toHaveBeenCalledOnce()
  })
})
