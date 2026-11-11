import type { ResolvedValaxyOptions } from '../packages/valaxy/node/types'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'
import { afterEach, describe, expect, it } from 'vitest'
import { resolveShareImage } from '../packages/valaxy/client/utils/seo'
import { StateManager } from '../packages/valaxy/node/app/state'
import { createMarkdownPlugin } from '../packages/valaxy/node/plugins/markdown/transform'
import { generatePageData, resolvePageImageImports } from '../packages/valaxy/node/plugins/markdown/transform/page-data'
import { pickPageShareImage } from '../packages/valaxy/shared/seo'

const roots: string[] = []
afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

describe('bundled share images', () => {
  it('emits fetchable source-relative images for regular and index pages, preserving URL suffixes and base', async () => {
    const root = await mkdtemp(join(tmpdir(), 'valaxy-share-assets-'))
    roots.push(root)
    const options = { userRoot: root, pages: [], mode: 'build', config: { build: {}, markdown: { highlight: (code: string) => code }, features: {}, siteConfig: { lastUpdated: false } } } as unknown as ResolvedValaxyOptions
    const state = new StateManager()
    const plugin = await createMarkdownPlugin(options, undefined, state)
    const transform = plugin.transform as (this: { error: (error: unknown) => never }, code: string, id: string) => Promise<{ code: string }>
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><rect width="12" height="12"/></svg>'
    const fixtures = [
      { path: 'posts/hello.md', frontmatter: {}, suffix: '' },
      { path: 'posts/imgdir/index.md', frontmatter: {}, suffix: '?width=1200&height=630#preview' },
      { path: 'posts/explicit.md', frontmatter: { ogImage: './pic.svg?width=1200&height=630#preview' }, suffix: '?width=1200&height=630#preview' },
      { path: 'posts/cover.md', frontmatter: { cover: './pic.svg' }, suffix: '' },
      { path: 'posts/legacy.md', frontmatter: { image: './pic.svg?size=2#legacy', cover: '/ignored.svg' }, suffix: '?size=2#legacy' },
      { path: 'posts/invalid.md', frontmatter: { ogImage: 'javascript:alert(1)', cover: 'HelloCover' }, suffix: '' },
      { path: 'posts/spaces.md', frontmatter: {}, suffix: '', filename: 'my pic.svg', source: './my%20pic.svg' },
      { path: 'posts/explicit-spaces.md', frontmatter: { ogImage: './my%20pic.svg' }, suffix: '', filename: 'my pic.svg', source: './my%20pic.svg' },
    ]
    const entries: string[] = []
    for (const [index, fixture] of fixtures.entries()) {
      const id = join(root, fixture.path)
      await mkdir(dirname(id), { recursive: true })
      await writeFile(join(dirname(id), fixture.filename || 'pic.svg'), svg)
      const frontmatter = Object.entries(fixture.frontmatter).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n')
      const rendered = await transform.call({
        error(error) {
          throw error
        },
      }, `---\n${frontmatter}\n---\n![small](${fixture.source || './pic.svg'}${fixture.suffix})`, id)
      const page = await generatePageData(rendered.code, { id, fileInfo: state.take(id) }, options)
      const { imports, assignments } = resolvePageImageImports(page.frontmatter, id)
      // Compile the actual generated image imports and assignments through Vite.
      const module = `${imports.join('\n')}\nconst pageData = { value: ${JSON.stringify(page)} };\n${assignments.join('\n')}\nexport default pageData.value.frontmatter`
      const entry = id.replace(/\.md$/, '.js')
      await writeFile(entry, module)
      entries.push(`export { default as page${index} } from ${JSON.stringify(`./${fixture.path.replace(/\.md$/, '.js')}`)}`)
    }
    const entry = join(root, 'entry.js')
    await writeFile(entry, entries.join('\n'))
    await build({
      configFile: false,
      root,
      base: '/blog/',
      logLevel: 'silent',
      build: {
        // Even a tiny asset must remain fetchable when inlining is enabled.
        assetsInlineLimit: 4096,
        rolldownOptions: { input: entry, output: { entryFileNames: 'images.mjs' }, preserveEntrySignatures: 'strict' },
      },
    })
    state.dispose()
    const result = await import(/* @vite-ignore */ pathToFileURL(join(root, 'dist/images.mjs')).href)
    for (const [index, fixture] of fixtures.entries()) {
      const fm = result[`page${index}`]
      const image = pickPageShareImage(fm)!
      expect(image).toMatch(/^\/blog\/assets\/[^?#]+\.svg/)
      expect(image.endsWith(fixture.suffix)).toBe(true)
      const canonical = resolveShareImage('https://example.com/blog/', `/${fixture.path.replace(/(?:\/index)?\.md$/, '')}`, image)
      expect(canonical).toBe(`https://example.com${image}`)
      const asset = new URL(canonical).pathname.replace(/^\/blog\//, '')
      expect(await readFile(join(root, 'dist', asset), 'utf8')).toBe(svg)
    }
  })

  it.each([{ password: 'test' }, { encrypt: true }, {}])('does not serialize private headings or inferred titles: %j', async (frontmatter) => {
    const id = '/pages/posts/private.md'
    const page = await generatePageData('<!-- valaxy-encrypt-start:test -->\n# Private heading\n<!-- valaxy-encrypt-end -->', {
      id,
      fileInfo: { id, title: 'Private heading', headers: [{ level: 1, title: 'Private heading', slug: 'private-heading', link: '#private-heading' }], links: [], frontmatter },
    }, { userRoot: '/pages', config: { features: {}, siteConfig: { lastUpdated: false } } } as ResolvedValaxyOptions)
    expect(page.title).toBe('')
    expect(page.headers).toEqual([])
  })

  it('preserves public TOC entries when a private parent heading is removed', async () => {
    const id = '/pages/posts/partial.md'
    const publicChild = { level: 3, title: 'Public', slug: 'public', link: '#public', children: [] }
    const headers = [{ level: 2, title: 'Secret', slug: 'secret', link: '#secret', children: [publicChild] }]
    const page = await generatePageData('<!-- valaxy-encrypt-start:test --><h2 id="secret">Secret</h2><!-- valaxy-encrypt-end --><h3 id="public">Public</h3>', {
      id,
      fileInfo: { id, title: 'Secret', headers, links: [], frontmatter: { title: 'Public title' } },
    }, { userRoot: '/pages', config: { features: {}, siteConfig: { lastUpdated: false } } } as ResolvedValaxyOptions)
    expect(page.title).toBe('Public title')
    expect(page.headers).toEqual([publicChild])
  })

  it('removes private descendants while preserving public descendants and the original header tree', async () => {
    const id = '/pages/posts/partial.md'
    const publicChild = { level: 4, title: 'Public child', slug: 'public-child', link: '#public-child', children: [] }
    const privateChild = { level: 3, title: 'Secret', slug: 'secret', link: '#secret', children: [publicChild] }
    const publicSibling = { level: 3, title: 'Public sibling', slug: 'public-sibling', link: '#public-sibling', children: [] }
    const parent = { level: 2, title: 'Public parent', slug: 'public-parent', link: '#public-parent', children: [privateChild, publicSibling] }
    const page = await generatePageData('<h2 id="public-parent">Public parent</h2><!-- valaxy-encrypt-start:test --><h3 id="secret">Secret</h3><!-- valaxy-encrypt-end --><h4 id="public-child">Public child</h4><h3 id="public-sibling">Public sibling</h3>', {
      id,
      fileInfo: { id, title: '', headers: [parent], links: [], frontmatter: {} },
    }, { userRoot: '/pages', config: { features: {}, siteConfig: { lastUpdated: false } } } as ResolvedValaxyOptions)
    expect(page.headers).toEqual([{ ...parent, children: [publicChild, publicSibling] }])
    expect(JSON.stringify(page.headers)).not.toContain('Secret')
    expect(parent.children).toEqual([privateChild, publicSibling])
  })

  it('leaves public, remote, component, and legacy missing-file candidates unchanged', () => {
    for (const cover of ['/public.svg', 'https://cdn.example.com/a.svg', '//cdn.example.com/a.svg', 'MyCover', './missing.svg']) {
      expect(resolvePageImageImports({ cover }, '/pages/posts/index.md')).toEqual({ imports: [], assignments: [] })
    }
  })
})
