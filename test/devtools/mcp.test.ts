import type { ViteDevServer } from 'vite'
import type { ValaxyMcpOptions } from '../../packages/devtools/src/node/mcp'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'vite'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ValaxyMcp } from '../../packages/devtools/src/node/mcp'

let root: string
let site: string
let server: ViteDevServer | undefined

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'valaxy-mcp-'))
  site = join(root, 'site')
  await mkdir(join(site, 'pages/posts'), { recursive: true })
  await mkdir(join(site, 'pages/collections/course'), { recursive: true })
  await writeFile(join(site, 'pages/posts/hello.md'), '---\ntitle: Hello\ndate: 2026-01-01\ntags: [Vue]\ncustom_secret: never-return-this\n---\nHello Valaxy. Fast previews with Vite.\n')
  await writeFile(join(site, 'pages/posts/second.md'), '---\ntitle: 第二篇\n---\nMarkdown and Vue.\n')
  await writeFile(join(site, 'pages/collections/course/lesson.md'), '---\ntitle: Lesson\n---\nA collection chapter about Vite.\n')
  for (const [name, flag] of Object.entries({ draft: 'draft: true', hidden: 'hide: true', protected: 'password: secret', encrypted: 'encrypt: true', gallery: 'gallery_password: secret' }))
    await writeFile(join(site, `pages/posts/${name}.md`), `---\ntitle: ${name}\n${flag}\n---\nPrivate needle.\n`)
})

afterEach(async () => {
  await server?.close()
  server = undefined
  await rm(root, { recursive: true, force: true })
})

async function start(base = '/', includeDrafts = false, options: Partial<ValaxyMcpOptions> = {}) {
  server = await createServer({
    root: site,
    configFile: false,
    devtools: false,
    base,
    plugins: [ValaxyMcp({ userRoot: site, includeDrafts, ...options })],
    server: { host: '127.0.0.1', port: 0 },
    logLevel: 'silent',
  })
  await server.listen()
  const origin = new URL(server.resolvedUrls!.local[0]).origin
  return `${origin}${base.replace(/\/$/, '')}/__valaxy_mcp`
}

async function rpc(url: string, method: string, params: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream', 'Origin': new URL(url).origin, ...headers },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const body = await response.text()
  const json = body.startsWith('event:') || body.startsWith('data:')
    ? JSON.parse(body.split('\n').find(line => line.startsWith('data: {'))!.slice(6))
    : JSON.parse(body)
  expect(response.status, body).toBe(200)
  return json.result
}

async function call(url: string, name: string, args: Record<string, unknown> = {}) {
  return rpc(url, 'tools/call', { name, arguments: args })
}

describe('valaxy MCP over Streamable HTTP', () => {
  it('exposes framework diagnostics with structured output and the same visibility boundary', async () => {
    const inspectPage = vi.fn(async (path: string) => ({ path, routes: [{ path: '/resolved', layout: 'post' }] }))
    const checkPage = vi.fn(async (path: string) => ({ path, ok: false, diagnostics: [{ code: 'route-collision', severity: 'error', hint: 'Choose a unique alias' }] }))
    const url = await start('/', false, { content: { inspectPage, checkPage } })
    const { tools } = await rpc(url, 'tools/list')
    expect(tools).toHaveLength(6)
    expect((await call(url, 'valaxy_inspect_page', { path: 'pages/posts/hello.md' })).structuredContent.routes[0].path).toBe('/resolved')
    expect((await call(url, 'valaxy_check_page', { path: 'pages/posts/hello.md' })).structuredContent.ok).toBe(false)
    expect(inspectPage).toHaveBeenCalledExactlyOnceWith('pages/posts/hello.md')
    for (const path of ['pages/posts/protected.md', 'pages/posts/draft.md', '../secret.md'])
      expect((await call(url, 'valaxy_check_page', { path })).isError).toBe(true)
    expect(checkPage).toHaveBeenCalledTimes(1)
    inspectPage.mockRejectedValueOnce(new Error(`Secret error at ${root}`))
    const error = await call(url, 'valaxy_inspect_page', { path: 'pages/posts/hello.md' })
    expect(error.isError).toBe(true)
    expect(JSON.stringify(error)).not.toContain(root)
  })

  it('honors inherited visibility without exporting site defaults', async () => {
    const url = await start('/', false, { frontmatterDefaults: { password: 'inherited-secret' } })
    expect((await call(url, 'valaxy_list_posts')).structuredContent.total).toBe(0)
    expect((await call(url, 'valaxy_read_page', { path: 'pages/posts/hello.md' })).isError).toBe(true)
  })

  it('initializes and advertises only four read-only content tools with named inputs', async () => {
    const url = await start()
    const initialized = await rpc(url, 'initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'valaxy-test', version: '1.0.0' } })
    expect(initialized.serverInfo.name).toBe('valaxy')
    const { tools } = await rpc(url, 'tools/list')
    expect(tools.map((tool: { name: string }) => tool.name).sort()).toEqual(['valaxy_list_collections', 'valaxy_list_posts', 'valaxy_read_page', 'valaxy_search_pages'])
    expect(tools.every((tool: { annotations: { readOnlyHint: boolean, destructiveHint: boolean } }) => tool.annotations.readOnlyHint && !tool.annotations.destructiveHint)).toBe(true)
    expect(tools.find((tool: { name: string }) => tool.name === 'valaxy_read_page').inputSchema.required).toEqual(['path'])
    expect((await rpc(url, 'resources/list')).resources).toEqual([])
  })

  it('paginates metadata without returning raw frontmatter or absolute paths', async () => {
    const url = await start()
    const first = await call(url, 'valaxy_list_posts', { limit: 1 })
    expect(first.structuredContent).toMatchObject({ total: 2, nextOffset: 1, items: [{ path: 'pages/posts/hello.md', title: 'Hello', date: '2026-01-01T00:00:00.000Z', tags: ['Vue'] }] })
    const second = await call(url, 'valaxy_list_posts', { limit: 1, offset: first.structuredContent.nextOffset })
    expect(second.structuredContent).toMatchObject({ nextOffset: null, items: [{ title: '第二篇' }] })
    expect(JSON.stringify(first)).not.toContain(site)
    expect(JSON.stringify(first)).not.toContain('never-return-this')
  })

  it('searches source content, browses collection directories and reads body segments', async () => {
    const url = await start('/blog/')
    const search = await call(url, 'valaxy_search_pages', { query: 'vItE', limit: 1 })
    expect(search.structuredContent).toMatchObject({ total: 2, nextOffset: 1, items: [{ path: 'pages/collections/course/lesson.md' }] })
    const collections = await call(url, 'valaxy_list_collections')
    expect(collections.structuredContent.items).toEqual([{ key: 'course', directory: 'pages/collections/course', pages: 1 }])
    const page = await call(url, 'valaxy_read_page', { path: search.structuredContent.items[0].path, limit: 5 })
    expect(page.structuredContent.content).toBe('A col')
    expect(page.structuredContent.nextOffset).toBe(5)
    const rest = await call(url, 'valaxy_read_page', { path: search.structuredContent.items[0].path, offset: 5 })
    expect(rest.structuredContent.content).toBe('lection chapter about Vite.\n')
    expect(rest.structuredContent.nextOffset).toBeNull()
  })

  it('excludes private pages consistently and includes drafts only after explicit opt-in', async () => {
    const url = await start()
    expect((await call(url, 'valaxy_search_pages', { query: 'private' })).structuredContent.total).toBe(0)
    for (const name of ['draft', 'hidden', 'protected', 'encrypted', 'gallery'])
      expect((await call(url, 'valaxy_read_page', { path: `pages/posts/${name}.md` })).isError).toBe(true)
    await server!.close()
    const draftsUrl = await start('/', true)
    expect((await call(draftsUrl, 'valaxy_search_pages', { query: 'private' })).structuredContent).toMatchObject({ total: 1, items: [{ draft: true, title: 'draft' }] })
    expect((await call(draftsUrl, 'valaxy_read_page', { path: 'pages/posts/protected.md' })).isError).toBe(true)
  })

  it('rejects traversal, symlinks outside pages, oversized files and unsafe calls', async () => {
    await writeFile(join(root, 'outside.md'), 'Outside secret')
    await writeFile(join(site, 'config.md'), 'Config secret')
    await symlink(join(root, 'outside.md'), join(site, 'pages/posts/outside.md'))
    await symlink(join(site, 'config.md'), join(site, 'pages/posts/config.md'))
    await writeFile(join(site, 'pages/posts/large.md'), 'x'.repeat(1024 * 1024 + 1))
    const url = await start()
    for (const path of ['../outside.md', join(root, 'outside.md'), 'pages/posts/outside.md', 'pages/posts/config.md', 'pages/posts/large.md', 'pages/../config.md', 'site.config.ts']) {
      const result = await call(url, 'valaxy_read_page', { path })
      expect(result.isError, path).toBe(true)
      expect(JSON.stringify(result)).not.toContain('Outside secret')
      expect(JSON.stringify(result)).not.toContain('Config secret')
    }
    expect((await call(url, 'valaxy_list_posts')).structuredContent.total).toBe(2)
    expect((await call(url, 'valaxy:create-post', { title: 'Oops' })).isError).toBe(true)
    expect((await call(url, 'devframe:state:read')).isError).toBe(true)
    expect(await readFile(join(root, 'outside.md'), 'utf8')).toBe('Outside secret')
  })

  it('validates inputs across the actual protocol boundary', async () => {
    const url = await start()
    for (const args of [{ limit: 0 }, { limit: 51 }, { offset: -1 }, { limit: '1' }, { includeDrafts: true }])
      expect((await call(url, 'valaxy_list_posts', args)).isError).toBe(true)
    expect((await call(url, 'valaxy_search_pages', { query: ' ' })).isError).toBe(true)
    expect((await call(url, 'valaxy_read_page', { path: 'pages/posts/hello.md', limit: 20001 })).isError).toBe(true)
  })

  it('never executes JavaScript frontmatter while reading or searching', async () => {
    const marker = globalThis as typeof globalThis & { valaxyMcpExecuted?: boolean }
    const url = await start()
    try {
      for (const language of ['js', 'javascript', 'JavaScript']) {
        await writeFile(join(site, 'pages/posts/executable.md'), `---${language}\n({ title: (globalThis.valaxyMcpExecuted = true, 'Executed') })\n---\nUntrusted content.\n`)
        expect((await call(url, 'valaxy_read_page', { path: 'pages/posts/executable.md' })).isError).toBe(true)
        expect((await call(url, 'valaxy_search_pages', { query: 'untrusted' })).structuredContent.total).toBe(0)
        expect(marker.valaxyMcpExecuted).toBeUndefined()
      }
    }
    finally {
      delete marker.valaxyMcpExecuted
    }
  })

  it('rejects missing and remote origins while leaving other middleware reachable', async () => {
    await mkdir(join(site, 'public'))
    await writeFile(join(site, 'public/check.txt'), 'ok')
    const url = await start()
    for (const origin of [undefined, 'https://untrusted.example']) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (origin)
        headers.Origin = origin
      const response = await fetch(url, { method: 'POST', headers, body: '{}' })
      expect(response.status).toBe(403)
    }
    expect(await (await fetch(new URL('/check.txt', url))).text()).toBe('ok')
  })

  it('reads live edits and normalizes index page routes', async () => {
    const url = await start()
    await writeFile(join(site, 'pages/index.md'), '---\ntitle: Home\n---\nWelcome.\n')
    expect((await call(url, 'valaxy_read_page', { path: 'pages/index.md' })).structuredContent).toMatchObject({ routePath: '/', content: 'Welcome.\n' })
    await writeFile(join(site, 'pages/index.md'), '---\ntitle: Home\n---\nUpdated.\n')
    expect((await call(url, 'valaxy_read_page', { path: 'pages/index.md' })).structuredContent.content).toBe('Updated.\n')
  })
})
