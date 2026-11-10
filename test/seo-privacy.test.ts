import type { ResolvedValaxyOptions, ValaxyNode } from '../packages/valaxy/node/types'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { getPosts } from '../packages/valaxy/node/modules/rss/utils'
import { resolveOptions } from '../packages/valaxy/node/options'
import { generatePageData } from '../packages/valaxy/node/plugins/markdown/transform/page-data'
import { createRouterOptions } from '../packages/valaxy/node/plugins/vueRouter'
import { extractMarkdownImage, plainSeoDescription, stripEncryptedContent } from '../packages/valaxy/shared/seo'
import { fixtureFolder } from './shared'

const privateBlock = '<!-- valaxy-encrypt-start:test -->\nPrivateBody ![private](./private.png)\n<!-- valaxy-encrypt-end -->'

describe('public SEO text', () => {
  it('removes partial encryption before stripping HTML comments', () => {
    expect(plainSeoDescription(`Public opening.\n\n${privateBlock}\n\nPublic ending.`)).toBe('Public opening. Public ending.')
    expect(extractMarkdownImage(`${privateBlock}\n\n![public](./public.png)`)).toBe('./public.png')
  })

  it('discards a private block when an excerpt cuts off its closing marker', () => {
    expect(stripEncryptedContent('Public.\n<!-- valaxy-encrypt-start:test -->\nPrivateBody')).toBe('Public.\n\n')
    expect(plainSeoDescription('<!-- valaxy-encrypt-start:test -->\nPrivateBody')).toBe('')
  })

  it('does not end a private block at a lookalike closing comment', () => {
    const markdown = '<!-- valaxy-encrypt-start:test -->\nPrivateA\n<!--valaxy-encrypt-end-->\nPrivateB ![private](./private.png)\n<!-- valaxy-encrypt-end -->\nPublic.'
    expect(plainSeoDescription(markdown)).toBe('Public.')
    expect(extractMarkdownImage(markdown)).toBeUndefined()
  })

  it('keeps public prose inside containers while removing their fences', () => {
    expect(plainSeoDescription('::: tip\nPublic advice.\n:::')).toBe('Public advice.')
  })
})

describe('route SEO privacy', () => {
  let base: ResolvedValaxyOptions
  let root: string
  let app: ValaxyNode

  beforeAll(async () => {
    base = await resolveOptions({ userRoot: fixtureFolder.userRoot })
  })

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'valaxy-seo-privacy-'))
    await mkdir(join(root, 'pages/posts'), { recursive: true })
    app = {
      options: {
        ...base,
        userRoot: root,
        roots: [root],
        tempDir: join(root, '.valaxy'),
        redirects: [],
        config: {
          ...base.config,
          router: {},
          markdown: { ...base.config.markdown, highlight: (code: string) => code },
          siteConfig: {
            ...base.config.siteConfig,
            lastUpdated: false,
            frontmatter: structuredClone(base.config.siteConfig.frontmatter),
            excerpt: { ...base.config.siteConfig.excerpt, auto: true },
          },
        },
      },
      hooks: { callHook: vi.fn() },
    } as unknown as ValaxyNode
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  function createRoute() {
    return {
      fullPath: '/posts/private',
      children: [],
      components: new Map([['default', join(root, 'pages/posts/private.md')]]),
      meta: {} as Record<string, any>,
      addToMeta(meta: Record<string, unknown>) {
        Object.assign(this.meta, meta)
      },
    }
  }

  async function writeRoute(source: string) {
    await writeFile(join(root, 'pages/posts/private.md'), source)
  }

  it.each(['password: test', 'encrypt: true'])('never infers a summary from whole-page protection (%s)', async (protection) => {
    await writeRoute(`---\n${protection}\n---\nPrivateBody\n\n<!-- more -->\nPrivate ending.`)
    const route = createRoute()
    const router = await createRouterOptions(app)
    await router.extendRoute!(route as never)
    expect(route.meta.seoDescription).toBeUndefined()
    expect(route.meta.excerpt).toBe('')
    expect(JSON.stringify(route.meta)).not.toContain('PrivateBody')
    expect(route.meta.frontmatter).not.toHaveProperty('password')
  })

  it('honors inherited encryption before removing passwords from public frontmatter', async () => {
    app.options.config.siteConfig.frontmatter.password = 'test'
    await writeRoute('PrivateBody')
    const route = createRoute()
    const router = await createRouterOptions(app)
    await router.extendRoute!(route as never)
    expect(route.meta.seoDescription).toBeUndefined()
    expect(route.meta.excerpt).toBe('')
    expect(JSON.stringify(route.meta)).not.toContain('PrivateBody')
    expect(route.meta.frontmatter).not.toHaveProperty('password')
  })

  it.each(['false', '\'\'', 'null'])('allows a page to override an inherited password with %s', async (password) => {
    app.options.config.siteConfig.frontmatter.password = 'test'
    await writeRoute(`---\npassword: ${password}\n---\nPublic opening.`)
    const route = createRoute()
    const router = await createRouterOptions(app)
    await router.extendRoute!(route as never)
    expect(route.meta.seoDescription).toBe('Public opening.')
    expect(route.meta.excerpt).toContain('Public opening.')
  })

  it('removes private sections before choosing the more separator', async () => {
    await writeRoute(`<!-- valaxy-encrypt-start:test -->\nPrivateBody\n<!-- more -->\nPrivate ending.\n<!-- valaxy-encrypt-end -->\n\nPublic opening.\n<!-- more -->\nNot in summary.`)
    const route = createRoute()
    const router = await createRouterOptions(app)
    await router.extendRoute!(route as never)
    expect(route.meta.seoDescription).toBe('Public opening.')
    expect(route.meta.excerpt).toContain('Public opening.')
    expect(JSON.stringify(route.meta)).not.toContain('PrivateBody')
  })

  it('preserves an explicit public description and manual excerpt', async () => {
    await writeRoute('---\npassword: test\ndescription: Public description.\nexcerpt: Public teaser.\n---\nPrivateBody')
    const route = createRoute()
    const router = await createRouterOptions(app)
    await router.extendRoute!(route as never)
    expect(route.meta.frontmatter.description).toBe('Public description.')
    expect(route.meta.excerpt).toBe('Public teaser.')
    expect(route.meta.seoDescription).toBeUndefined()
  })

  it('clears a stale summary when an existing page becomes encrypted', async () => {
    await writeRoute('PrivateBody')
    const route = createRoute()
    const router = await createRouterOptions(app)
    await router.extendRoute!(route as never)
    expect(route.meta.seoDescription).toBe('PrivateBody')
    await writeRoute('---\npassword: test\n---\nPrivateBody')
    await router.extendRoute!(route as never)
    expect(route.meta.seoDescription).toBeUndefined()
    expect(route.meta.excerpt).toBe('')
  })

  it.each([{ password: 'test' }, { encrypt: true }])('does not infer a private first image: %j', async (frontmatter) => {
    const id = join(root, 'pages/posts/private.md')
    const page = await generatePageData('<img src="./private.png">', {
      id,
      fileInfo: { id, title: 'Private', headers: [], links: [], frontmatter },
    }, app.options)
    expect(page.frontmatter.firstImage).toBeUndefined()
  })

  it.each([false, true])('does not include private body text anywhere in RSS (fullText: %s)', async (fullText) => {
    app.options.config.modules = { ...app.options.config.modules, rss: { ...app.options.config.modules.rss, fullText } }
    await writeRoute(`---\ntitle: Public\ndate: 2024-01-01\n---\nPublic opening.\n\n${privateBlock}`)
    const encrypted = join(root, 'pages/posts/encrypted.md')
    await writeFile(encrypted, '---\ntitle: Encrypted\nencrypt: true\n---\nPrivateBody')
    const posts = await getPosts({
      author: { name: 'Author' },
      files: [join(root, 'pages/posts/private.md'), encrypted],
      DOMAIN: 'https://example.com',
    }, app.options)
    expect(posts?.map(post => post.title)).toEqual(['Public'])
    expect(posts?.[0].description).toBe('Public opening.')
    expect(JSON.stringify(posts)).not.toContain('PrivateBody')
    expect(JSON.stringify(posts)).not.toContain('private.png')
  })
})
