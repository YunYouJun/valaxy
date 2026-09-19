import type { ValaxyNode } from '../packages/valaxy/node/types'
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'pathe'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createValaxyNode } from '../packages/valaxy/node/app'
import { createContentService } from '../packages/valaxy/node/content'
import { resolveOptions } from '../packages/valaxy/node/options'
import { fixtureFolder } from './shared'

let root: string
let app: ValaxyNode
let base: Awaited<ReturnType<typeof resolveOptions>>
const path = 'pages/posts/hello.md'

async function write(file: string, content: string) {
  await mkdir(join(root, file, '..'), { recursive: true })
  await writeFile(join(root, file), content)
}

beforeAll(async () => {
  base = await resolveOptions({ userRoot: fixtureFolder.userRoot })
})

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'valaxy-content-'))
  app = createValaxyNode({
    ...base,
    userRoot: root,
    roots: [root],
    addons: [],
    redirects: [],
    config: {
      ...base.config,
      router: {},
      hooks: {},
      vite: { base: '/blog/' },
      layouts: {},
      markdown: { ...base.config.markdown, highlight: code => code },
      siteConfig: { ...base.config.siteConfig, frontmatter: { description: 'Site default', tags: ['Default'] } },
    },
  })
  await write(path, '---\ntitle: Hello\ndate: 2026-09-19\n---\nHello.\n')
  await write('layouts/post.vue', '<template><slot /></template>')
})

afterEach(async () => {
  await rm(root, { force: true, recursive: true })
})

describe('framework-aware article inspection', () => {
  it('runs the real route pipeline including defaults and final hooks', async () => {
    app.options.config.router!.extendRoute = (route) => {
      if (route.components.get('default') === join(root, path)) {
        route.path = '/stories/hello'
        route.addAlias(['/old-hello'])
        route.addToMeta({ layout: 'custom', frontmatter: { draft: true } })
      }
    }
    app.hook('vue-router:beforeWriteFiles', (tree) => {
      for (const route of tree) {
        if (route.fullPath === '/stories/hello')
          route.addToMeta({ frontmatter: { title: 'After hooks' } })
      }
    })
    const page = await createContentService(app).inspectPage(path)
    expect(page).toMatchObject({
      path,
      routes: [{ path: '/stories/hello', aliases: ['/old-hello'], previewPath: '/blog/stories/hello', layout: 'custom' }],
      metadata: { title: 'After hooks', description: 'Site default', date: '2026-09-19' },
      draft: true,
      includedInProductionRoutes: false,
    })
    expect(JSON.stringify(page)).not.toContain(root)
  })

  it('reflects edits and removals without restarting or leaking redirect accumulation', async () => {
    const service = createContentService(app)
    await write(path, '---\ntitle: Before\nfrom: /old\n---\nText')
    expect((await service.inspectPage(path)).metadata.title).toBe('Before')
    await write(path, '---\ntitle: After\ndraft: true\nfrom: /old\n---\nText')
    expect(await service.inspectPage(path)).toMatchObject({ metadata: { title: 'After' }, includedInProductionRoutes: false })
    expect(app.options.redirects).toEqual([])
    await rm(join(root, path))
    await expect(service.inspectPage(path)).rejects.toThrow()
  })

  it('keeps hidden routes in production and projects only selected metadata', async () => {
    await write(path, '---\ntitle: Hello\nhide: true\npassword: secret\ncustom_token: never-export\n---\nSecret body')
    const page = await createContentService(app).inspectPage(path)
    expect(page).toMatchObject({ hidden: true, includedInProductionRoutes: true })
    expect(JSON.stringify(page)).not.toMatch(/secret|never-export|Secret body/)
  })

  it('enforces inherited and hook-resolved privacy for MCP', async () => {
    const service = createContentService(app, { publicOnly: true })
    app.options.config.siteConfig.frontmatter.draft = true
    await expect(service.inspectPage(path)).rejects.toThrow('visibility')
    expect((await createContentService(app, { publicOnly: true, includeDrafts: true }).inspectPage(path)).draft).toBe(true)
    app.options.config.siteConfig.frontmatter.draft = false
    app.hook('vue-router:extendRoute', route => route.addToMeta({ frontmatter: { hide: true } }))
    await expect(service.inspectPage(path)).rejects.toThrow('visibility')
    await expect(service.checkPage(path)).rejects.toThrow('visibility')
  })

  it('rejects traversal and symlink escapes', async () => {
    await write('private.md', 'secret')
    await symlink(join(root, 'private.md'), join(root, 'pages/posts/linked.md'))
    const service = createContentService(app)
    for (const file of ['pages/../private.md', 'pages/posts/linked.md', join(root, path)])
      await expect(service.inspectPage(file)).rejects.toThrow()
  })

  it('checks valid Markdown links, source references and public images', async () => {
    await write('pages/posts/next.md', '---\ntitle: Next\n---\nNext')
    await write('public/photo.png', 'image')
    await write('pages/posts/local.png', 'image')
    await write(path, '---\ntitle: Hello\n---\n[Next](/blog/posts/next) [source](./next.md) ![public](/photo.png) ![local](./local.png)\n\n[external](https://example.invalid/) [anchor](#section)\n\n`![ignored](missing.png)`\n')
    const result = await createContentService(app).checkPage(path)
    expect(result.ok).toBe(true)
    expect(result.diagnostics).toEqual([])
  })

  it('reports actionable diagnostics and actual source line numbers', async () => {
    await write(path, '---\ntitle: Hello\ndraft: "false"\ndate: not-a-date\nlayout: missing\n---\n[Lost](/does-not-exist)\n\n![Lost](./missing.png)\n')
    const result = await createContentService(app).checkPage(path)
    expect(result.ok).toBe(false)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'frontmatter-type', line: 3, severity: 'error' }),
      expect.objectContaining({ code: 'frontmatter-date', line: 4, severity: 'error' }),
      expect.objectContaining({ code: 'layout-missing', line: 5 }),
      expect.objectContaining({ code: 'missing-link', line: 7 }),
      expect.objectContaining({ code: 'missing-image', line: 9 }),
    ]))
    expect(result.diagnostics.every(diagnostic => diagnostic.hint)).toBe(true)
  })

  it('finds alias collisions and links to unpublished drafts', async () => {
    await write('pages/posts/next.md', '---\ntitle: Next\ndraft: true\n---\nNext')
    await write(path, '---\ntitle: Hello\n---\n[Draft](/posts/next)')
    app.options.config.router!.extendRoute = route => route.addAlias(['/same'])
    const result = await createContentService(app).checkPage(path)
    expect(result.ok).toBe(false)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'route-collision', severity: 'error' }),
      expect.objectContaining({ code: 'link-to-draft', severity: 'warning' }),
    ]))
  })

  it('returns a syntax diagnostic and never evaluates JavaScript frontmatter', async () => {
    const service = createContentService(app)
    await write(path, '---\ntitle: [broken\n---\nBody')
    expect(await service.checkPage(path)).toMatchObject({ ok: false, diagnostics: [{ code: 'invalid-frontmatter' }] })
    const marker = globalThis as typeof globalThis & { valaxyContentExecuted?: boolean }
    try {
      await write(path, '---js\n({ title: (globalThis.valaxyContentExecuted = true, "Executed") })\n---\nBody')
      expect(await service.checkPage(path)).toMatchObject({ ok: false, diagnostics: [{ code: 'invalid-frontmatter' }] })
      expect(marker.valaxyContentExecuted).toBeUndefined()
      await write(path, '---\ntitle: Hello\n---\nBody')
      await write('pages/posts/other.md', '---js\n({ title: (globalThis.valaxyContentExecuted = true, "Executed") })\n---\nBody')
      expect(await service.checkPage(path)).toMatchObject({ ok: false, diagnostics: [{ code: 'route-resolution-failed' }] })
      expect(marker.valaxyContentExecuted).toBeUndefined()
      await rm(join(root, 'pages/posts/other.md'))
      expect((await service.checkPage(path)).ok).toBe(true)
    }
    finally {
      delete marker.valaxyContentExecuted
    }
  })

  it('uses the real layout registry including normalized names and exclusions', async () => {
    await write('custom-layouts/MyPost.vue', '<template><slot /></template>')
    await write(path, '---\ntitle: Hello\nlayout: my-post\n---\nBody')
    app.options.config.layouts = { layoutsDirs: 'custom-layouts' }
    const service = createContentService(app)
    expect((await service.checkPage(path)).diagnostics).toEqual([])
    app.options.config.layouts.exclude = ['**/MyPost.vue']
    expect((await service.checkPage(path)).diagnostics).toContainEqual(expect.objectContaining({ code: 'layout-missing' }))
    await service.dispose()
    await expect(service.inspectPage(path)).rejects.toThrow('disposed')
  })

  it('resolves Unicode and percent-encoded paths and checks source links to drafts', async () => {
    await write('pages/posts/中文.md', '---\ntitle: Chinese\n---\nBody')
    await write('pages/posts/100%.md', '---\ntitle: Percent\n---\nBody')
    await write('pages/posts/draft.md', '---\ntitle: Draft\ndraft: true\n---\nBody')
    await write('public/posts/file.pdf', 'PDF')
    await write(path, '---\ntitle: Hello\n---\n[Chinese](/posts/%E4%B8%AD%E6%96%87) [Percent](/posts/100%25) [Draft](./draft.md) [PDF](./file.pdf)')
    const result = await createContentService(app).checkPage(path)
    expect(result.diagnostics).toEqual([expect.objectContaining({ code: 'link-to-draft' })])
  })

  it('bounds diagnostic responses while retaining the complete diagnostic count', async () => {
    await write(path, `---\ntitle: Hello\n---\n${Array.from({ length: 105 }, (_, i) => `![missing](./missing-${i}.png)`).join('\n\n')}`)
    const result = await createContentService(app).checkPage(path)
    expect(result.totalDiagnostics).toBe(105)
    expect(result.diagnostics).toHaveLength(100)
  })
})
