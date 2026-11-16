import type { Plugin } from 'vite'
import type { RouteRecordRaw } from 'vue-router'
import type { ResolvedValaxyOptions, ValaxyNode } from '../packages/valaxy/node/types'
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer as createHttpServer } from 'node:http'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'
import { build, createServer } from 'vite'
import { afterEach, expect, it, vi } from 'vitest'
import { resolveOptions } from '../packages/valaxy/node/options'
import { createExcerptAssets } from '../packages/valaxy/node/plugins/excerptAssets'
import { createRouterPlugin } from '../packages/valaxy/node/plugins/vueRouter'
import { fixtureFolder } from './shared'

const roots: string[] = []
afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

async function fixture(directory = tmpdir()) {
  const root = await mkdtemp(join(directory, 'valaxy-excerpt-assets-'))
  roots.push(root)
  async function write(path: string, content: string) {
    const file = join(root, path)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, content)
    return file
  }
  return { root, write }
}

const basePath = '/blog/'
const suffix = '?size=2&amp;v=3#preview'
const entrySource = 'export { routes } from "vue-router/auto-routes"'
const stubPages: Plugin = {
  name: 'test-page-components',
  transform(_, id) {
    if (id.endsWith('.md'))
      return 'export default {}'
  },
}

function post(title: string, body: string, excerpt?: string) {
  return `---\ntitle: ${title}\ndate: 2024-01-01\n${excerpt === undefined ? '' : `excerpt: ${JSON.stringify(excerpt)}\n`}---\n${body}\n`
}

function svg(content: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg"><text>${content}</text></svg>`
}

async function plugins(root: string, mode: 'dev' | 'build', config: NonNullable<ResolvedValaxyOptions['config']['router']> = {}) {
  const base = await resolveOptions({ userRoot: fixtureFolder.userRoot })
  const assets = createExcerptAssets()
  const app = {
    options: {
      ...base,
      mode,
      userRoot: root,
      roots: [root],
      tempDir: join(root, '.valaxy'),
      redirects: [],
      config: {
        ...base.config,
        router: config,
        markdown: { ...base.config.markdown, highlight: (code: string) => code },
        siteConfig: { ...base.config.siteConfig, lastUpdated: false, excerpt: { auto: true, type: 'html', length: 200 } },
      },
    },
    hooks: { callHook: vi.fn() },
  } as unknown as ValaxyNode
  return [await createRouterPlugin(app, basePath, undefined, assets), assets.plugin, stubPages]
}

function excerptsByName(routes: RouteRecordRaw[]) {
  const excerpts = new Map<string, string>()
  function visit(records: RouteRecordRaw[]) {
    for (const route of records) {
      if (typeof route.name === 'string' && typeof route.meta?.excerpt === 'string')
        excerpts.set(route.name, route.meta.excerpt)
      if (route.children)
        visit(route.children)
    }
  }
  visit(routes)
  return excerpts
}

it('bundles excerpts from all three sources and preserves file identity, HTML and URL suffixes', async () => {
  const { root, write } = await fixture()
  const html = `<img src='./%E5%9B%BE%201.svg${suffix}' alt="manual" loading="lazy">`
  await write('pages/posts/one/index.md', post('one', `![auto](./图%201.svg?size=2&v=3#preview)`))
  await write('pages/posts/two/index.md', post('two', 'Body', html))
  await write('pages/posts/three/index.md', post('three', '![more](./small.svg)\n\n<!-- more -->\n\nExcluded text'))
  await write('pages/posts/one/图 1.svg', svg('one'))
  await write('pages/posts/two/图 1.svg', svg('two'))
  await write('pages/posts/three/small.svg', svg('three'))
  const entry = await write('entry.js', entrySource)
  await build({
    configFile: false,
    root,
    base: basePath,
    logLevel: 'silent',
    plugins: await plugins(root, 'build'),
    build: {
      assetsInlineLimit: 4096,
      rolldownOptions: { input: entry, output: { entryFileNames: 'routes.mjs' }, preserveEntrySignatures: 'strict' },
    },
  })

  const { routes } = await import(/* @vite-ignore */ pathToFileURL(join(root, 'dist/routes.mjs')).href)
  const excerpts = excerptsByName(routes)
  expect(excerpts.size).toBe(3)
  const urls: string[] = []
  for (const name of ['one', 'two']) {
    const url = excerpts.get(`/posts/${name}/`)?.match(/src="([^"]+)"/)?.[1]
    expect(url).toMatch(/^\/blog\/assets\/.+\.svg\?size=2&amp;v=3#preview$/)
    urls.push(url!)
    const file = decodeURIComponent(url!.split('?')[0].slice(basePath.length))
    expect(await readFile(join(root, 'dist', file), 'utf8')).toContain(`<text>${name}</text>`)
  }
  expect(urls[0]).not.toBe(urls[1])
  expect(excerpts.get('/posts/two/')).toContain('alt="manual" loading="lazy"')
  expect(excerpts.get('/posts/three/')).toContain('src="data:image/svg+xml')
  expect(excerpts.get('/posts/three/')).not.toContain('Excluded text')
})

it('keeps remote, public, missing, dynamic, and escaped code images unchanged', async () => {
  const { root, write } = await fixture()
  const html = '<img src="https://example.com/a.png"><img src="//example.com/a.png"><img src="/a.png"><img src="data:image/png;base64,abc"><img src="./missing.png"><img :src="image"><pre>&lt;img src="./local.svg"&gt;</pre>'
  await write('pages/posts/unchanged/index.md', post('unchanged', 'Body', html))
  await write('pages/posts/unchanged/local.svg', svg('local'))
  const entry = await write('entry.js', entrySource)
  const server = await createServer({
    configFile: false,
    root,
    base: basePath,
    logLevel: 'silent',
    plugins: await plugins(root, 'dev'),
    server: { middlewareMode: true },
  })
  try {
    const { routes } = await server.ssrLoadModule(entry)
    expect(excerptsByName(routes).get('/posts/unchanged/')).toBe(html)
  }
  finally {
    await server.close()
  }
})

it('serves the new excerpt image on route HMR while beforeWriteFiles is still pending', async () => {
  const { root, write } = await fixture()
  const image = (name: string) => post('changed', `![image](./${name}.svg#preview)\n\n<!-- more -->\n\nBody`)
  await write('pages/posts/changed/a.svg', svg('a'))
  await write('pages/posts/changed/b.svg', svg('b'))
  const source = await write('pages/posts/changed/index.md', image('a'))
  const entryFile = await write('entry.js', entrySource)
  const pendingHook = Promise.withResolvers<void>()
  let writingUpdate = false
  let writes = 0
  const server = await createServer({
    configFile: false,
    root,
    base: basePath,
    logLevel: 'silent',
    plugins: await plugins(root, 'dev', {
      async beforeWriteFiles() {
        if (++writes > 1) {
          writingUpdate = true
          await pendingHook.promise
        }
      },
    }),
    server: { middlewareMode: true },
  })
  const http = createHttpServer(server.middlewares)
  try {
    await new Promise<void>(done => http.listen(0, '127.0.0.1', done))
    const address = http.address()
    if (!address || typeof address === 'string')
      throw new Error('Fixture HTTP server did not bind to a port')
    const origin = `http://127.0.0.1:${address.port}`
    async function get(path: string) {
      const response = await fetch(new URL(path, origin))
      expect(response.ok).toBe(true)
      return (await response.text()).split('//# sourceMappingURL')[0]
    }
    const entry = await get(`${basePath}entry.js`)
    const routesUrl = entry.match(/"([^"]*vue-router\/auto-routes)"/)?.[1]
    expect(routesUrl).toBeDefined()
    expect(await get(routesUrl!)).toContain('/changed/a.svg?import')

    // The file router starts its own watcher. Retry the edit if startup is still in progress.
    await vi.waitFor(async () => {
      if (!writingUpdate)
        await writeFile(source, image('b'))
      expect(writingUpdate).toBe(true)
    }, { timeout: 6000, interval: 150 })

    const updated = await get(`${routesUrl}?t=${Date.now()}`)
    expect(updated).toContain('/changed/b.svg?import')
    const { routes } = await server.ssrLoadModule(entryFile)
    const excerpt = excerptsByName(routes).get('/posts/changed/')
    expect(excerpt).toMatch(/src="\/blog\/[^"]*\/changed\/b\.svg#preview"/)
  }
  finally {
    pendingHook.resolve()
    await new Promise<void>(done => http.close(() => done()))
    await server.close()
  }
}, 15_000)

it('builds real SSG under a base path when an excerpt references a reserved filename', async () => {
  // Resolve workspace packages as the production publishing tests do.
  const { root, write } = await fixture(join(import.meta.dirname, 'fixtures'))
  await write('package.json', '{"type":"module","private":true}')
  await write('valaxy.config.ts', `export default {
    theme: 'yun',
    features: { katex: false },
    vite: { base: '${basePath}' },
    modules: { rss: { enable: false } },
    siteConfig: { title: 'SSG fixture', url: 'https://example.com/blog/', lastUpdated: false, llms: { enable: false } },
  }`)
  await write('pages/posts/ordinary/pic.svg', svg('ordinary'))
  await write('pages/posts/ordinary/index.md', post('ordinary', 'Body', `<img src="./pic.svg${suffix}" alt="ssg-ordinary">`))
  await write('pages/posts/reserved/chart#1.svg', svg('reserved'))
  await write('pages/posts/reserved/index.md', post('reserved', 'Body', '<img src="./chart%231.svg" alt="ssg-reserved">'))

  const command = 'import { execBuild } from "./packages/valaxy/node/cli/build.ts"; await execBuild({ root: process.argv[1], ssg: true, output: "dist", log: "error" })'
  try {
    await promisify(execFile)(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', command, root], {
      cwd: resolve(import.meta.dirname, '..'),
      env: { ...process.env, CI: 'true' },
      timeout: 60_000,
    })
  }
  catch (error) {
    const failure = error as Error & { stdout?: string, stderr?: string }
    throw new Error(`Excerpt SSG failed:\n${failure.stdout || ''}\n${failure.stderr || failure.message}`, { cause: error })
  }

  const html = await readFile(join(root, 'dist/index.html'), 'utf8')
  const tag = html.match(/<img\s[^>]*alt="ssg-ordinary"[^>]*>/)?.[0]
  const url = tag?.match(/src="([^"]+)"/)?.[1]
  expect(url).toMatch(/^\/blog\/assets\/pic[.-][^"]+\.svg\?size=2&amp;v=3#preview$/)
  expect(await readFile(join(root, 'dist/assets', basename(url!.split('?')[0])), 'utf8')).toContain('<text>ordinary</text>')
  expect(html).toMatch(/<img\s[^>]*src="\.\/chart%231\.svg"[^>]*alt="ssg-reserved"/)
}, 65_000)
