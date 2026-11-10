import type { ResolvedValaxyOptions } from '../packages/valaxy/node'
import type { ValaxyNode } from '../packages/valaxy/node/types'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { resolveShareImage } from '../packages/valaxy/client/utils/seo'
import { trailingSlashAlias, writeTrailingSlashAliases } from '../packages/valaxy/node/build/render'
import { getPosts } from '../packages/valaxy/node/modules/rss/utils'
import { filterPublicPosts } from '../packages/valaxy/node/modules/utils'
import { resolveOptions } from '../packages/valaxy/node/options'
import { createRouterOptions } from '../packages/valaxy/node/plugins/vueRouter'
import {
  isUnpublishedPage,
  mergePageExcludes,
  notFoundSitemapPaths,
  omitProductionDraftRoutes,
} from '../packages/valaxy/shared/page-policy'
import {
  extractMarkdownImage,
  openGraphType,
  pickShareImage,
  plainSeoDescription,
  publicAuthor,
} from '../packages/valaxy/shared/seo'
import { fixtureFolder } from './shared'

describe('unpublished pages', () => {
  it('hides underscore paths and README.md unless the site opts in', () => {
    expect(isUnpublishedPage('posts/hello.md')).toBe(false)
    expect(isUnpublishedPage('_drafts/secret.md')).toBe(true)
    expect(isUnpublishedPage('posts/_drafts/secret.md')).toBe(true)
    expect(isUnpublishedPage('_secret.md')).toBe(true)
    expect(isUnpublishedPage('README.md')).toBe(true)
    expect(isUnpublishedPage('guide/readme.md')).toBe(true)
    expect(isUnpublishedPage('posts/readme-guide.md')).toBe(false)
    expect(isUnpublishedPage('_drafts/secret.md', { underscore: true })).toBe(false)
    expect(isUnpublishedPage('README.md', { readme: true })).toBe(false)
  })

  it('keeps the default exclude globs ahead of a custom list', () => {
    expect(mergePageExcludes(undefined, ['**/private/**'])).toEqual([
      '**/_*/**',
      '**/_*',
      '**/[Rr][Ee][Aa][Dd][Mm][Ee].[Mm][Dd]',
      '**/private/**',
    ])
    expect(mergePageExcludes({ underscore: true, readme: true }, ['**/private/**'])).toEqual(['**/private/**'])
  })

  it('drops draft routes in production and keeps them when opted in', () => {
    const routes = [
      { path: '/posts/public', meta: { frontmatter: {} } },
      {
        path: '/posts',
        meta: {},
        children: [{ path: 'draft', meta: { frontmatter: { draft: true } } }],
      },
    ]
    expect(omitProductionDraftRoutes(routes).map(route => route.path)).toEqual(['/posts/public', '/posts'])
    expect(routes[1].children).toEqual([])
    expect(omitProductionDraftRoutes([
      { meta: { frontmatter: { draft: true } } },
    ], true)).toHaveLength(1)
  })

  it('omits not-found pages from the sitemap and keeps similarly named posts', () => {
    expect(notFoundSitemapPaths(['/', '/404', '/zh/404/', '/posts/404-notes'])).toEqual(['/404', '/zh/404'])
  })

  it('filters draft files and underscore files out of public collections', () => {
    const posts = [
      { data: { title: 'Public' }, content: '', filePath: '/site/pages/posts/public.md' },
      { data: { title: 'Draft', draft: true }, content: '', filePath: '/site/pages/posts/draft.md' },
      { data: { title: 'Secret' }, content: '', filePath: '/site/pages/_drafts/secret.md' },
      { data: { title: 'Notes' }, content: '', filePath: '/site/pages/README.md' },
    ]
    expect(filterPublicPosts(posts, undefined, '/site').map(post => post.data.title)).toEqual(['Public'])
    expect(filterPublicPosts(posts, { drafts: true, underscore: true, readme: true }, '/site')).toHaveLength(4)
  })
})

describe('share metadata', () => {
  it('builds a plain excerpt without code, images, or the title heading', () => {
    const markdown = `# Title

\`\`\`ts
const secret = 'do-not-publish'
\`\`\`

This is the first paragraph with a [link](/posts/next).

Second paragraph adds a little more.
`
    const description = plainSeoDescription(markdown, 200)
    expect(description).toBe('This is the first paragraph with a link. Second paragraph adds a little more.')
    expect(description).not.toContain('secret')
    expect(description).not.toContain('#')
    expect(description).not.toContain('![')
  })

  it('drops markdown containers instead of leaving the fence syntax', () => {
    const markdown = `## 内置图标

使用方式参考[添加代码块标题与图标](/guide/markdown)。

::: code-group
\`\`\`ts
const hidden = true
\`\`\`
:::

接下来是正文。
`
    const description = plainSeoDescription(markdown, 200)
    expect(description).toBe('使用方式参考添加代码块标题与图标。 接下来是正文。')
    expect(description).not.toContain(':::')
    expect(description).not.toContain('hidden')
  })

  it('trims a long excerpt on a word boundary', () => {
    const description = plainSeoDescription(`${'alpha '.repeat(40)}omega`, 40)
    expect(description.endsWith('…')).toBe(true)
    expect(description.length).toBeLessThanOrEqual(41)
    expect(description).not.toMatch(/\s…$/)
  })

  it('returns nothing when the page is only a fenced code block', () => {
    expect(plainSeoDescription('```ts\nconst x = 1\n```')).toBe('')
  })

  it('ignores images inside fenced code and markdown titles', () => {
    const markdown = '```md\n![skip](secret.png)\n```\n\n![cover](./keep.png "title")'
    expect(extractMarkdownImage(markdown)).toBe('./keep.png')
  })

  it('picks a real image and skips bare names', () => {
    expect(pickShareImage([undefined, 'CoverComponent', 'HelloCover', '/images/cover.png'])).toBe('/images/cover.png')
    expect(pickShareImage(['https://cdn.example/a.jpg "title"'])).toBe('https://cdn.example/a.jpg')
  })

  it('resolves a relative image from the page directory', () => {
    expect(resolveShareImage('https://example.com/', '/posts/hello', './cover.png'))
      .toBe('https://example.com/posts/cover.png')
    expect(resolveShareImage('https://example.com/', '/posts/hello', '/images/cover.png'))
      .toBe('https://example.com/images/cover.png')
  })

  it('uses article for posts and website for other pages', () => {
    expect(openGraphType('/posts/hello', 'post')).toBe('article')
    expect(openGraphType('/posts/hello')).toBe('article')
    expect(openGraphType('/posts/')).toBe('website')
    expect(openGraphType('/about', 'default')).toBe('website')
  })

  it('omits an empty author email and link', () => {
    expect(publicAuthor({ name: '云游君', email: '', link: '  ' })).toEqual({ name: '云游君' })
    expect(publicAuthor({ name: 'Ada', email: 'ada@example.com', link: 'https://ada.example' })).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      link: 'https://ada.example',
    })
  })
})

describe('trailing slash output', () => {
  it('maps an extensionless page to a directory index and leaves directory routes alone', () => {
    expect(trailingSlashAlias('/posts/hello')).toBe('posts/hello/index.html')
    expect(trailingSlashAlias('/posts/')).toBeUndefined()
    expect(trailingSlashAlias('/')).toBeUndefined()
  })

  it('copies the page after the canonical file exists and does not replace a real index', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'valaxy-slash-'))
    try {
      await mkdir(join(outDir, 'about'), { recursive: true })
      await mkdir(join(outDir, 'posts'), { recursive: true })
      await writeFile(join(outDir, 'posts/hello.html'), '<link rel="canonical" href="https://example.com/posts/hello">')
      await writeFile(join(outDir, 'about/index.html'), 'real about')
      await writeTrailingSlashAliases(outDir, ['/posts/hello', '/about/'])
      expect(await readFile(join(outDir, 'posts/hello/index.html'), 'utf8')).toContain('/posts/hello')
      expect(await readFile(join(outDir, 'about/index.html'), 'utf8')).toBe('real about')
    }
    finally {
      await rm(outDir, { recursive: true, force: true })
    }
  })
})

describe('rss publishing', () => {
  it('skips underscore drafts and fills a missing description from the paragraph', async () => {
    const root = await mkdtemp(join(tmpdir(), 'valaxy-rss-'))
    const posts = join(root, 'pages/posts')
    const drafts = join(root, 'pages/posts/_drafts')
    await mkdir(drafts, { recursive: true })
    await writeFile(join(posts, 'note.md'), `---
title: Note
date: 2024-02-01
---
# Note

The opening paragraph is the summary.

\`\`\`ts
const hidden = true
\`\`\`
`)
    await writeFile(join(drafts, 'secret.md'), `---
title: Secret
date: 2024-03-01
---
Do not publish.
`)
    const options = {
      userRoot: root,
      config: {
        siteConfig: { url: 'https://example.com/', lang: 'en', excerpt: { length: 200 } },
        modules: { rss: { fullText: false, extractImagePathsFromHTML: false } },
      },
    } as ResolvedValaxyOptions

    try {
      const result = await getPosts({
        author: publicAuthor({ name: '云游君', email: '', link: '' }),
        files: [join(posts, 'note.md'), join(drafts, 'secret.md')],
        DOMAIN: 'https://example.com',
      }, options)
      expect(result?.map(post => post.title)).toEqual(['Note'])
      expect(result?.[0].description).toBe('The opening paragraph is the summary.')
      expect(result?.[0].description).not.toContain('hidden')
      expect(result?.[0].author).toEqual([{ name: '云游君' }])
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})

describe('router publishing', () => {
  it('removes underscore and README routes before they are rendered', async () => {
    const options = await resolveOptions({ userRoot: fixtureFolder.userRoot })
    const app = {
      options: {
        ...options,
        config: {
          ...options.config,
          siteConfig: { ...options.config.siteConfig, publishing: { drafts: false, underscore: false, readme: false } },
        },
      },
      hooks: { callHook: vi.fn() },
    } as unknown as ValaxyNode
    const router = await createRouterOptions(app)

    async function extend(fullPath: string, file: string) {
      const route = {
        fullPath,
        children: [],
        components: new Map([['default', file]]),
        meta: {},
        addToMeta: vi.fn(),
        delete: vi.fn(),
      }
      await router.extendRoute!(route as never)
      return route
    }

    const draft = await extend('/_drafts/secret', join(options.userRoot, 'pages/_drafts/secret.md'))
    const readme = await extend('/README', join(options.userRoot, 'pages/README.md'))
    const guide = await extend('/posts/my-readme', join(options.userRoot, 'pages/posts/my-readme.md'))
    const vueReadme = await extend('/README', join(options.userRoot, 'pages/README.vue'))
    const post = await extend('/posts/hello', join(options.userRoot, 'pages/posts/hello.vue'))

    expect(draft.delete).toHaveBeenCalledOnce()
    expect(draft.addToMeta).not.toHaveBeenCalled()
    expect(readme.delete).toHaveBeenCalledOnce()
    expect(post.delete).not.toHaveBeenCalled()
    expect(guide.delete).not.toHaveBeenCalled()
    expect(vueReadme.delete).not.toHaveBeenCalled()
  })
})
