import type { ViteDevServer } from 'vite'
import type { ValaxyNode } from '../packages/valaxy/node/types'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { request as httpRequest } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'pathe'
import { createServer } from 'vite'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { ValaxyDevtools } from '../packages/devtools/src/node'
import { createValaxyNode } from '../packages/valaxy/node/app'
import { editorPlugin } from '../packages/valaxy/node/editor/plugin'
import { EditorRoutes } from '../packages/valaxy/node/editor/routes'
import { resolveOptions } from '../packages/valaxy/node/options'
import { createRouterPlugin } from '../packages/valaxy/node/plugins/vueRouter'
import { fixtureFolder } from './shared'

let root: string
let app: ValaxyNode
let base: Awaited<ReturnType<typeof resolveOptions>>
let server: ViteDevServer | undefined
let origin: string
let projectId: string
let snapshot: EditorRoutes
const headers = { 'X-Valaxy-Client': '1', 'Content-Type': 'application/json' }

async function write(file: string, text = '---\ntitle: Private\ndraft: true\nhide: true\npassword: never-return\n---\nSecret body') {
  await mkdir(join(root, file, '..'), { recursive: true })
  await writeFile(join(root, file), text)
}

beforeAll(async () => {
  base = await resolveOptions({ userRoot: fixtureFolder.userRoot })
})
beforeEach(async () => {
  root = await realpath(await mkdtemp(join(tmpdir(), 'valaxy-editor-')))
  projectId = createHash('sha256').update(root.replaceAll('\\', '/')).digest('hex')
  app = createValaxyNode({
    ...base,
    userRoot: root,
    roots: [root],
    tempDir: join(root, '.valaxy'),
    addons: [],
    redirects: [],
    config: {
      ...base.config,
      devtools: false,
      router: {},
      hooks: {},
      markdown: { ...base.config.markdown, highlight: code => code },
    },
  })
  snapshot = new EditorRoutes()
  await write('pages/posts/hello.md')
})
afterEach(async () => {
  await server?.close()
  server = undefined
  if (root)
    await rm(root, { force: true, recursive: true })
})

async function start(devtools?: 'native' | 'standalone', router = true) {
  app.options.config.devtools = Boolean(devtools)
  server = await createServer({
    root,
    configFile: false,
    base: '/blog/',
    logLevel: 'silent',
    devtools: devtools === 'native' ? { apply: 'serve', mcp: false } : false,
    plugins: [
      editorPlugin(app.options, snapshot),
      ...(router ? [await createRouterPlugin(app, undefined, snapshot)] : []),
      ...(devtools ? [ValaxyDevtools({ userRoot: root })] : []),
    ],
    server: { host: '127.0.0.1', port: 0, cors: true, allowedHosts: true },
  })
  await server.listen()
  origin = new URL(server.resolvedUrls!.local[0]).origin
}
async function lookup(file: string, id = projectId) {
  const response = await fetch(`${origin}/blog/__valaxy__/routes`, { method: 'POST', headers, body: JSON.stringify({ projectId: id, file }) })
  return { status: response.status, data: await response.json() }
}

describe('native editor protocol', () => {
  it('advertises a versioned capability with DevTools disabled and no absolute paths', async () => {
    await start()
    const response = await fetch(`${origin}/blog/__valaxy__/capabilities`, { headers })
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.headers.get('access-control-allow-origin')).toBeNull()
    const result = await response.json()
    expect(result).toMatchObject({ protocolVersion: 1, projectId, base: '/blog/', capabilities: { routes: { version: 1, resolve: '/blog/__valaxy__/routes' }, devtools: { status: 'disabled' } } })
    expect(JSON.stringify(result)).not.toContain(root)
  })

  it.each(['native', 'standalone'] as const)('advertises the actual %s DevTools mount without credentials', async (host) => {
    await start(host)
    const result = await (await fetch(`${origin}/blog/__valaxy__/capabilities`, { headers })).json()
    expect(result.capabilities.devtools).toEqual({ status: 'available', path: '/blog/__valaxy_devtools__/', authentication: 'browser' })
    expect((await fetch(`${origin}${result.capabilities.devtools.path}`)).status).toBe(200)
    expect(JSON.stringify(result)).not.toMatch(/token|otp|password|#/i)
  })

  it('uses final hooks, custom folders, private articles and multiple canonical routes without rerunning hooks', async () => {
    await write('content/私密 #%.md')
    app.options.config.router = {
      routesFolder: [join(root, 'pages'), { src: join(root, 'content'), path: '/articles/' }],
      extendRoute(route) {
        if (route.fullPath === '/posts/hello') {
          route.path = '/rewritten'
          route.addAlias(['/alias'])
        }
      },
      beforeWriteFiles(tree) {
        for (const route of tree) {
          if (route.fullPath === '/rewritten')
            route.path = '/final'
        }
      },
    }
    let calls = 0
    app.hook('vue-router:beforeWriteFiles', (tree) => {
      calls++
      tree.insert('/second', join(root, 'pages/posts/hello.md'))
    })
    await start()
    const before = calls
    for (let i = 0; i < 2; i++)
      expect(await lookup('pages/posts/hello.md')).toEqual({ status: 200, data: { status: 'resolved', routes: expect.arrayContaining([{ path: '/final', dynamic: false }, { path: '/second', dynamic: false }]) } })
    const result = await lookup('content/私密 #%.md')
    expect(result.data).toEqual({ status: 'resolved', routes: [{ path: '/articles/%E7%A7%81%E5%AF%86%20%23%25', dynamic: false }] })
    expect(JSON.stringify(result)).not.toMatch(/Secret body|never-return|password|draft|hide/)
    expect(calls).toBe(before)
  })

  it('distinguishes pending, unknown and dynamic routes', async () => {
    await start(undefined, false)
    expect(await lookup('pages/posts/hello.md')).toMatchObject({ status: 503, data: { status: 'pending' } })
    expect(await lookup('pages/missing.md')).toMatchObject({ status: 200, data: { status: 'not-found' } })
    await server!.close()
    await write('pages/[category]/[slug].md')
    await start()
    expect(await lookup('pages/[category]/[slug].md')).toMatchObject({ status: 200, data: { status: 'resolved', routes: [{ path: '/:category/:slug', dynamic: true }] } })
  })

  it('observes additions, route edits and removals through the live router watcher', async () => {
    app.options.config.router = {
      extendRoute(route) {
        if ((route.meta.frontmatter as Record<string, unknown> | undefined)?.title === 'Updated')
          route.path = '/updated'
      },
    }
    await start()
    await write('pages/posts/new.md', '---\ntitle: New\n---')
    await expect.poll(async () => (await lookup('pages/posts/new.md')).data.status).toBe('resolved')
    await write('pages/posts/new.md', '---\ntitle: Updated\n---')
    await expect.poll(async () => (await lookup('pages/posts/new.md')).data.routes[0]?.path).toBe('/updated')
    await rm(join(root, 'pages/posts/new.md'))
    await expect.poll(async () => (await lookup('pages/posts/new.md')).data.status).toBe('not-found')
  })

  it('rejects browser requests, traversal, symlink escapes and another workspace', async () => {
    app.options.config.router = { watch: false }
    await start()
    const url = `${origin}/blog/__valaxy__/capabilities`
    for (const forbidden of [{}, { ...headers, Origin: origin }, { ...headers, Origin: 'null' }, { ...headers, 'Sec-Fetch-Site': 'same-origin' }]) {
      const response = await fetch(url, { headers: forbidden })
      expect(response.status, JSON.stringify(forbidden)).toBe(403)
      expect(response.headers.get('access-control-allow-origin')).toBeNull()
    }
    const badHost = await new Promise<number | undefined>((resolve, reject) => {
      const request = httpRequest(url, { headers: { ...headers, Host: 'evil.example' } }, (response) => {
        response.resume()
        resolve(response.statusCode)
      })
      request.on('error', reject)
      request.end()
    })
    expect(badHost).toBe(403)
    expect((await fetch(url, { method: 'POST', headers })).status).toBe(405)
    expect((await lookup('pages/posts/hello.md', 'another-workspace')).status).toBe(409)
    for (const file of ['../hello.md', '/etc/private.md', 'C:/private.md', 'pages/../hello.md', 'pages\\hello.md', 'pages/./hello.md'])
      expect((await lookup(file)).status).toBe(400)
    const outside = await mkdtemp(join(tmpdir(), 'valaxy-outside-'))
    try {
      await writeFile(join(outside, 'private.md'), 'Private')
      await symlink(join(outside, 'private.md'), join(root, 'pages/escape.md'))
      expect((await lookup('pages/escape.md')).status).toBe(400)
    }
    finally {
      await rm(outside, { force: true, recursive: true })
    }
  })

  it('matches canonical route sources when the workspace root is a symlink', async () => {
    const alias = `${root}-alias`
    await write('content/post.md')
    await symlink(root, alias, 'junction')
    try {
      app.options.userRoot = alias
      app.options.config.router = { routesFolder: [{ src: join(root, 'content'), path: '/custom/' }] }
      await start()
      expect(await lookup('content/post.md')).toMatchObject({ status: 200, data: { status: 'resolved', routes: [{ path: '/custom/post', dynamic: false }] } })
    }
    finally {
      await rm(alias, { force: true })
    }
  })

  it('reports pending during an asynchronous route edit instead of returning its old URL', async () => {
    let signal!: () => void
    let finish!: () => void
    const entered = new Promise<void>((resolve) => {
      signal = resolve
    })
    const gate = new Promise<void>((resolve) => {
      finish = resolve
    })
    app.options.config.router = {
      async extendRoute(route) {
        if ((route.meta.frontmatter as Record<string, unknown> | undefined)?.title === 'Updated') {
          signal()
          await gate
          route.path = '/latest'
        }
      },
    }
    await start()
    await write('pages/posts/hello.md', '---\ntitle: Updated\n---')
    try {
      await entered
      expect(await lookup('pages/posts/hello.md')).toMatchObject({ status: 503, data: { status: 'pending', routes: [] } })
    }
    finally {
      finish()
    }
    await expect.poll(async () => (await lookup('pages/posts/hello.md')).data.routes[0]?.path).toBe('/latest')
  })
})
