import type { Plugin } from 'vite'
import type { ValaxyNode } from '../packages/valaxy/node/types'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build, createServer } from 'vite'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveOptions } from '../packages/valaxy/node/options'
import { createExcerptAssets } from '../packages/valaxy/node/plugins/excerptAssets'
import { createRouterPlugin } from '../packages/valaxy/node/plugins/vueRouter'
import { fixtureFolder } from './shared'

const roots: string[] = []
afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'valaxy-excerpt-assets-'))
  roots.push(root)
  const assets = createExcerptAssets()
  const excerpts: string[] = []
  for (const [index, folder] of ['one', 'two'].entries()) {
    const source = join(root, folder, 'index.md')
    await mkdir(dirname(source), { recursive: true })
    await writeFile(join(dirname(source), '图 1.svg'), `<svg xmlns="http://www.w3.org/2000/svg"><text>${index}</text></svg>`)
    const html = `<p>Excerpt ${index}</p><img src='./%E5%9B%BE%201.svg?size=2&amp;v=3#preview' alt="test" loading="lazy">`
    excerpts.push(assets.register(html, source))
  }
  const plugin: Plugin = {
    name: 'test-routes',
    resolveId(id) {
      if (id === 'vue-router/auto-routes')
        return `\0${id}`
    },
    load(id) {
      if (id === '\0vue-router/auto-routes')
        return `export default ${JSON.stringify(excerpts)}`
    },
  }
  const entry = join(root, 'entry.js')
  await writeFile(entry, 'export { default } from "vue-router/auto-routes"')
  return { root, assets, entry, plugins: [plugin, assets.plugin] }
}

describe('excerpt assets', () => {
  it('bundles source-relative images with distinct identities and preserves HTML, suffixes and base', async () => {
    const { root, entry, plugins } = await fixture()
    await build({ configFile: false, root, base: '/blog/', plugins, logLevel: 'silent', build: {
      assetsInlineLimit: 4096,
      rolldownOptions: { input: entry, output: { entryFileNames: 'excerpts.mjs' }, preserveEntrySignatures: 'strict' },
    } })
    const { default: excerpts } = await import(/* @vite-ignore */ pathToFileURL(join(root, 'dist/excerpts.mjs')).href)
    const urls: string[] = []
    for (const [index, html] of excerpts.entries()) {
      expect(html).toContain(`Excerpt ${index}`)
      expect(html).toContain('alt="test" loading="lazy"')
      const url = html.match(/src="([^"]+)"/)![1]
      urls.push(url)
      expect(url).toMatch(/^\/blog\/assets\/.+\.svg\?size=2&amp;v=3#preview$/)
      const file = decodeURIComponent(url.split('?')[0].replace('/blog/', ''))
      expect(await readFile(join(root, 'dist', file), 'utf8')).toContain(`<text>${index}</text>`)
    }
    expect(urls[0]).not.toBe(urls[1])
  })

  it('resolves the same images in the development SSR pipeline', async () => {
    const { root, entry, plugins } = await fixture()
    const server = await createServer({ configFile: false, root, base: '/blog/', plugins, logLevel: 'silent', server: { middlewareMode: true } })
    try {
      const { default: excerpts } = await server.ssrLoadModule(entry)
      expect(excerpts[0]).toContain('/one/')
      expect(excerpts[1]).toContain('/two/')
      expect(excerpts[0]).toContain('?size=2&amp;v=3#preview')
      expect(excerpts.join('')).not.toContain('__VALAXY_EXCERPT_ASSET_')
    }
    finally {
      await server.close()
    }
  })

  it('leaves remote, public, missing, dynamic, and escaped code images alone', () => {
    const assets = createExcerptAssets()
    const html = '<img src="https://example.com/a.png"><img src="//example.com/a.png"><img src="/a.png"><img src="data:image/png;base64,abc"><img src="./missing.png"><img :src="image"><pre>&lt;img src="./a.png"&gt;</pre>'
    expect(assets.register(html, '/pages/post.md')).toBe(html)
  })
})

it('processes automatic, more-marker and frontmatter excerpts through the real file router', async () => {
  const root = await mkdtemp(join(tmpdir(), 'valaxy-excerpt-router-'))
  roots.push(root)
  const base = await resolveOptions({ userRoot: fixtureFolder.userRoot })
  const assets = createExcerptAssets()
  for (const name of ['auto', 'more', 'manual']) {
    const dir = join(root, 'pages/posts', name)
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, 'pic.svg'), `<svg xmlns="http://www.w3.org/2000/svg"><text>${name}</text></svg>`)
    const frontmatter = name === 'manual' ? `excerpt: '<img src="./pic.svg" alt="manual">'\n` : ''
    await writeFile(join(dir, 'index.md'), `---\ntitle: ${name}\ndate: 2024-01-01\n${frontmatter}---\n![${name}](./pic.svg)\n${name === 'more' ? '<!-- more -->' : ''}\nBody`)
  }
  const app = {
    options: { ...base, mode: 'build', userRoot: root, roots: [root], tempDir: join(root, '.valaxy'), redirects: [], config: { ...base.config, router: {}, markdown: { ...base.config.markdown, highlight: (code: string) => code }, siteConfig: { ...base.config.siteConfig, lastUpdated: false, excerpt: { auto: true, type: 'html', length: 200 } } } },
    hooks: { callHook: vi.fn() },
  } as unknown as ValaxyNode
  const router = await createRouterPlugin(app, '/blog/', undefined, assets)
  const entry = join(root, 'entry.js')
  await writeFile(entry, 'export { routes } from "vue-router/auto-routes"')
  await build({ configFile: false, root, base: '/blog/', logLevel: 'silent', plugins: [router, assets.plugin, {
    name: 'test-page-components',
    transform(_, id) {
      if (id.endsWith('.md'))
        return 'export default {}'
    },
  }], build: { rolldownOptions: { input: entry, output: { entryFileNames: 'routes.mjs' }, preserveEntrySignatures: 'strict' } } })
  const { routes } = await import(/* @vite-ignore */ pathToFileURL(join(root, 'dist/routes.mjs')).href)
  const flatten = (items: any[]): any[] => items.flatMap(route => [route, ...flatten(route.children || [])])
  const excerpts = flatten(routes).map(route => route.meta?.excerpt).filter(Boolean)
  expect(excerpts).toHaveLength(3)
  for (const excerpt of excerpts) {
    expect(excerpt).not.toContain('__VALAXY_EXCERPT_ASSET_')
    expect(excerpt).toMatch(/src="\/blog\/assets\/pic[.-][^"?]+\.svg"/)
  }
})
