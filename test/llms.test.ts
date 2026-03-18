import type { ResolvedValaxyOptions } from '../packages/valaxy/node'
import { resolve } from 'node:path'
import fs from 'fs-extra'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { build } from '../packages/valaxy/node/modules/llms/utils'
import { filePathToUrlPath, filterPublicPosts, removeTrailingSlash } from '../packages/valaxy/node/modules/utils'

const mockUserRoot = resolve(__dirname, 'fixtures/llms')

function createMockOptions(overrides: Partial<{
  url: string
  lang: string
  title: string
  description: string
  enable: boolean
  fullText: boolean
  files: boolean
  prompt: string
  include: string[]
}> = {}): ResolvedValaxyOptions {
  return {
    userRoot: mockUserRoot,
    config: {
      siteConfig: {
        url: overrides.url ?? 'https://example.com/',
        lang: overrides.lang ?? 'en',
        title: overrides.title ?? 'Test Blog',
        description: overrides.description ?? 'A test blog',
        llms: {
          enable: overrides.enable ?? true,
          fullText: overrides.fullText ?? true,
          files: overrides.files ?? true,
          prompt: overrides.prompt ?? '',
          include: overrides.include,
        },
      },
      modules: {
        rss: {
          enable: true,
          fullText: false,
          extractImagePathsFromHTML: true,
        },
      },
    },
  } as ResolvedValaxyOptions
}

describe('llms module', () => {
  beforeEach(async () => {
    await fs.ensureDir(mockUserRoot)
    await fs.ensureDir(resolve(mockUserRoot, 'pages/posts'))
    await fs.ensureDir(resolve(mockUserRoot, 'dist'))

    await fs.writeFile(
      resolve(mockUserRoot, 'pages/posts/hello.md'),
      `---
title: Hello World
date: 2024-01-15
description: My first post
categories: Tutorials
tags:
  - valaxy
  - blog
---
# Hello World

This is my first post.`,
      'utf-8',
    )

    await fs.writeFile(
      resolve(mockUserRoot, 'pages/posts/second.md'),
      `---
title: Second Post
date: 2024-01-01
description: Another post
tags:
  - notes
---
# Second Post

Content of second post.`,
      'utf-8',
    )

    await fs.writeFile(
      resolve(mockUserRoot, 'pages/posts/draft.md'),
      `---
title: Draft Post
date: 2024-01-10
draft: true
---
This is a draft.`,
      'utf-8',
    )

    await fs.writeFile(
      resolve(mockUserRoot, 'pages/posts/encrypted.md'),
      `---
title: Encrypted Post
date: 2024-01-05
password: secret
---
This is encrypted.`,
      'utf-8',
    )

    await fs.writeFile(
      resolve(mockUserRoot, 'pages/posts/hidden.md'),
      `---
title: Hidden Post
date: 2024-01-08
hide: true
---
This is hidden.`,
      'utf-8',
    )
  })

  afterEach(async () => {
    await fs.remove(mockUserRoot)
  })

  describe('llms.txt generation', () => {
    it('should generate llms.txt with correct format', async () => {
      await build(createMockOptions())

      const llmsTxt = await fs.readFile(resolve(mockUserRoot, 'dist/llms.txt'), 'utf-8')

      expect(llmsTxt).toContain('# Test Blog')
      expect(llmsTxt).toContain('> A test blog')
      expect(llmsTxt).toContain('## Posts')
      expect(llmsTxt).toContain('[Hello World](https://example.com/posts/hello.md)')
      expect(llmsTxt).toContain('[Second Post](https://example.com/posts/second.md)')
      expect(llmsTxt).toContain(': My first post')
      expect(llmsTxt).toContain(': Another post')
    })

    it('should sort posts by date descending', async () => {
      await build(createMockOptions())

      const llmsTxt = await fs.readFile(resolve(mockUserRoot, 'dist/llms.txt'), 'utf-8')

      const helloIndex = llmsTxt.indexOf('Hello World')
      const secondIndex = llmsTxt.indexOf('Second Post')
      // Hello World (2024-01-15) should come before Second Post (2024-01-01)
      expect(helloIndex).toBeLessThan(secondIndex)
    })

    it('should filter out draft, encrypted, and hidden posts', async () => {
      await build(createMockOptions())

      const llmsTxt = await fs.readFile(resolve(mockUserRoot, 'dist/llms.txt'), 'utf-8')

      expect(llmsTxt).not.toContain('Draft Post')
      expect(llmsTxt).not.toContain('Encrypted Post')
      expect(llmsTxt).not.toContain('Hidden Post')
    })

    it('should include custom prompt in blockquote', async () => {
      await build(createMockOptions({ prompt: 'Please summarize each post.' }))

      const llmsTxt = await fs.readFile(resolve(mockUserRoot, 'dist/llms.txt'), 'utf-8')

      expect(llmsTxt).toContain('> A test blog')
      expect(llmsTxt).toContain('> Please summarize each post.')
    })
  })

  describe('llms-full.txt generation', () => {
    it('should generate llms-full.txt with inlined content and metadata', async () => {
      await build(createMockOptions({ fullText: true }))

      const fullTxt = await fs.readFile(resolve(mockUserRoot, 'dist/llms-full.txt'), 'utf-8')

      expect(fullTxt).toContain('# Test Blog')
      expect(fullTxt).toContain('## Hello World')
      expect(fullTxt).toContain('- **Date**: 2024-01-15')
      expect(fullTxt).toContain('- **Categories**: Tutorials')
      expect(fullTxt).toContain('- **Tags**: valaxy, blog')
      expect(fullTxt).toContain('This is my first post.')
      expect(fullTxt).toContain('## Second Post')
      expect(fullTxt).toContain('Content of second post.')
    })

    it('should not generate llms-full.txt when fullText is false', async () => {
      await build(createMockOptions({ fullText: false }))

      const exists = await fs.pathExists(resolve(mockUserRoot, 'dist/llms-full.txt'))
      expect(exists).toBe(false)
    })
  })

  describe('raw .md file copying', () => {
    it('should copy raw .md files to dist with YAML frontmatter', async () => {
      await build(createMockOptions({ files: true }))

      const helloMd = await fs.readFile(resolve(mockUserRoot, 'dist/posts/hello.md'), 'utf-8')
      // Should include YAML frontmatter
      expect(helloMd).toMatch(/^---\n/)
      expect(helloMd).toContain('title: Hello World')
      expect(helloMd).toContain('date:')
      expect(helloMd).toContain('description: My first post')
      expect(helloMd).toContain('categories:')
      expect(helloMd).toContain('tags:')
      expect(helloMd).toContain('valaxy')
      expect(helloMd).toContain('blog')
      // Should NOT contain sensitive fields
      expect(helloMd).not.toContain('password')
      expect(helloMd).not.toContain('draft')
      expect(helloMd).not.toContain('hide')
      // Should also include original body content
      expect(helloMd).toContain('This is my first post.')

      const secondMd = await fs.readFile(resolve(mockUserRoot, 'dist/posts/second.md'), 'utf-8')
      expect(secondMd).toContain('title: Second Post')
      expect(secondMd).toContain('notes')
    })

    it('should not copy .md files when files is false', async () => {
      await build(createMockOptions({ files: false }))

      const exists = await fs.pathExists(resolve(mockUserRoot, 'dist/posts/hello.md'))
      expect(exists).toBe(false)
    })

    it('should include YAML frontmatter for frontmatter-only posts (no body content)', async () => {
      await fs.writeFile(
        resolve(mockUserRoot, 'pages/posts/frontmatter-only.md'),
        `---
title: Frontmatter Only
date: 2024-01-12
categories:
  - A
  - B
---
`,
        'utf-8',
      )

      await build(createMockOptions({ files: true }))

      const mdContent = await fs.readFile(resolve(mockUserRoot, 'dist/posts/frontmatter-only.md'), 'utf-8')
      // Should not be empty — YAML frontmatter ensures non-zero file
      expect(mdContent.trim().length).toBeGreaterThan(0)
      expect(mdContent).toContain('title: Frontmatter Only')
      expect(mdContent).toMatch(/date:.*2024-01-12/)
      expect(mdContent).toContain('  - A')
      expect(mdContent).toContain('  - B')
    })

    it('should not copy draft/encrypted/hidden posts as .md', async () => {
      await build(createMockOptions({ files: true }))

      expect(await fs.pathExists(resolve(mockUserRoot, 'dist/posts/draft.md'))).toBe(false)
      expect(await fs.pathExists(resolve(mockUserRoot, 'dist/posts/encrypted.md'))).toBe(false)
      expect(await fs.pathExists(resolve(mockUserRoot, 'dist/posts/hidden.md'))).toBe(false)
    })

    it('should preserve custom frontmatter fields and strip sensitive ones', async () => {
      await fs.writeFile(
        resolve(mockUserRoot, 'pages/posts/custom-fields.md'),
        `---
title: Custom Fields Post
date: 2024-01-20
author: John
cover: /images/cover.jpg
layout: post
custom_field: hello
gallery_password: secret123
password_hint: my hint
encryptedContent: abc
partiallyEncryptedContents:
  - x
  - y
encryptedPhotos: xyz
---
Content here.`,
        'utf-8',
      )

      await build(createMockOptions({ files: true }))

      const md = await fs.readFile(resolve(mockUserRoot, 'dist/posts/custom-fields.md'), 'utf-8')
      // Custom fields should be preserved
      expect(md).toContain('author: John')
      expect(md).toContain('cover: /images/cover.jpg')
      expect(md).toContain('layout: post')
      expect(md).toContain('custom_field: hello')
      // All sensitive fields should be stripped
      expect(md).not.toContain('gallery_password')
      expect(md).not.toContain('password_hint')
      expect(md).not.toContain('encryptedContent')
      expect(md).not.toContain('partiallyEncryptedContents')
      expect(md).not.toContain('encryptedPhotos')
    })
  })

  describe('index.md normalization', () => {
    beforeEach(async () => {
      await fs.ensureDir(resolve(mockUserRoot, 'pages/posts/nested-post'))
      await fs.writeFile(
        resolve(mockUserRoot, 'pages/posts/nested-post/index.md'),
        `---
title: Nested Post
date: 2024-01-20
description: A nested post
---
# Nested Post

Content of nested post.`,
        'utf-8',
      )
    })

    it('should normalize index.md paths in llms.txt', async () => {
      await build(createMockOptions())

      const llmsTxt = await fs.readFile(resolve(mockUserRoot, 'dist/llms.txt'), 'utf-8')

      expect(llmsTxt).toContain('[Nested Post](https://example.com/posts/nested-post.md)')
      expect(llmsTxt).not.toContain('index.md')
    })

    it('should write index.md post as /posts/nested-post.md in dist', async () => {
      await build(createMockOptions({ files: true }))

      const nestedMd = await fs.readFile(resolve(mockUserRoot, 'dist/posts/nested-post.md'), 'utf-8')
      expect(nestedMd).toContain('title: Nested Post')
      expect(nestedMd).toMatch(/date:.*2024-01-20/)
      expect(nestedMd).toContain('Content of nested post.')

      // Should NOT create a dist/posts/nested-post/index.md
      expect(await fs.pathExists(resolve(mockUserRoot, 'dist/posts/nested-post/index.md'))).toBe(false)
    })
  })

  describe('empty siteConfig.url', () => {
    it('should use relative paths when url is not set', async () => {
      await build(createMockOptions({ url: '/' }))

      const llmsTxt = await fs.readFile(resolve(mockUserRoot, 'dist/llms.txt'), 'utf-8')

      expect(llmsTxt).toContain('[Hello World](/posts/hello.md)')
      expect(llmsTxt).not.toContain('undefined')
    })
  })

  describe('include configuration', () => {
    beforeEach(async () => {
      await fs.ensureDir(resolve(mockUserRoot, 'pages/guide'))
      await fs.writeFile(
        resolve(mockUserRoot, 'pages/guide/getting-started.md'),
        `---
title: Getting Started
date: 2024-02-01
description: How to get started
---
# Getting Started

Follow these steps to get started.`,
        'utf-8',
      )

      await fs.ensureDir(resolve(mockUserRoot, 'pages/guide/advanced'))
      await fs.writeFile(
        resolve(mockUserRoot, 'pages/guide/advanced/plugins.md'),
        `---
title: Plugins Guide
date: 2024-02-05
description: How to use plugins
---
# Plugins Guide

Learn how to create and use plugins.`,
        'utf-8',
      )
    })

    it('should default to posts/**/*.md when include is not set', async () => {
      await build(createMockOptions())

      const llmsTxt = await fs.readFile(resolve(mockUserRoot, 'dist/llms.txt'), 'utf-8')

      expect(llmsTxt).toContain('Hello World')
      expect(llmsTxt).toContain('Second Post')
      expect(llmsTxt).not.toContain('Getting Started')
      expect(llmsTxt).not.toContain('Plugins Guide')
    })

    it('should include all pages when set to **/*.md', async () => {
      await build(createMockOptions({ include: ['**/*.md'] }))

      const llmsTxt = await fs.readFile(resolve(mockUserRoot, 'dist/llms.txt'), 'utf-8')

      expect(llmsTxt).toContain('Hello World')
      expect(llmsTxt).toContain('Second Post')
      expect(llmsTxt).toContain('Getting Started')
      expect(llmsTxt).toContain('Plugins Guide')
    })

    it('should include only specified directories', async () => {
      await build(createMockOptions({ include: ['guide/**/*.md'] }))

      const llmsTxt = await fs.readFile(resolve(mockUserRoot, 'dist/llms.txt'), 'utf-8')

      expect(llmsTxt).not.toContain('Hello World')
      expect(llmsTxt).not.toContain('Second Post')
      expect(llmsTxt).toContain('Getting Started')
      expect(llmsTxt).toContain('Plugins Guide')
    })

    it('should support multiple include patterns', async () => {
      await build(createMockOptions({ include: ['posts/**/*.md', 'guide/**/*.md'] }))

      const llmsTxt = await fs.readFile(resolve(mockUserRoot, 'dist/llms.txt'), 'utf-8')

      expect(llmsTxt).toContain('Hello World')
      expect(llmsTxt).toContain('Getting Started')
      expect(llmsTxt).toContain('Plugins Guide')
    })

    it('should group pages by top-level directory in llms.txt', async () => {
      await build(createMockOptions({ include: ['**/*.md'] }))

      const llmsTxt = await fs.readFile(resolve(mockUserRoot, 'dist/llms.txt'), 'utf-8')

      expect(llmsTxt).toContain('## Posts')
      expect(llmsTxt).toContain('## Guide')
    })

    it('should generate .md files for non-posts pages', async () => {
      await build(createMockOptions({ include: ['**/*.md'], files: true }))

      const guideMd = await fs.readFile(resolve(mockUserRoot, 'dist/guide/getting-started.md'), 'utf-8')
      expect(guideMd).toContain('# Getting Started')

      const pluginsMd = await fs.readFile(resolve(mockUserRoot, 'dist/guide/advanced/plugins.md'), 'utf-8')
      expect(pluginsMd).toContain('# Plugins Guide')
    })

    it('should include non-posts pages in llms-full.txt', async () => {
      await build(createMockOptions({ include: ['**/*.md'], fullText: true }))

      const fullTxt = await fs.readFile(resolve(mockUserRoot, 'dist/llms-full.txt'), 'utf-8')

      expect(fullTxt).toContain('## Getting Started')
      expect(fullTxt).toContain('Follow these steps to get started.')
      expect(fullTxt).toContain('## Plugins Guide')
    })
  })
})

describe('module shared utilities', () => {
  describe('filePathToUrlPath', () => {
    const userRoot = '/project'

    it('should convert regular .md files', () => {
      expect(filePathToUrlPath('/project/pages/posts/hello.md', userRoot))
        .toBe('/posts/hello')
    })

    it('should normalize index.md to parent directory path', () => {
      expect(filePathToUrlPath('/project/pages/posts/foo/index.md', userRoot))
        .toBe('/posts/foo')
    })

    it('should handle deeply nested index.md', () => {
      expect(filePathToUrlPath('/project/pages/posts/2024/01/index.md', userRoot))
        .toBe('/posts/2024/01')
    })

    it('should handle deeply nested regular .md', () => {
      expect(filePathToUrlPath('/project/pages/posts/nested/deep.md', userRoot))
        .toBe('/posts/nested/deep')
    })

    it('should convert non-posts pages', () => {
      expect(filePathToUrlPath('/project/pages/guide/getting-started.md', userRoot))
        .toBe('/guide/getting-started')
    })

    it('should convert non-posts index.md pages', () => {
      expect(filePathToUrlPath('/project/pages/guide/config/index.md', userRoot))
        .toBe('/guide/config')
    })

    it('should convert root-level pages', () => {
      expect(filePathToUrlPath('/project/pages/about.md', userRoot))
        .toBe('/about')
    })
  })

  describe('removeTrailingSlash', () => {
    it('should remove trailing slash', () => {
      expect(removeTrailingSlash('https://example.com/')).toBe('https://example.com')
    })

    it('should not modify root slash', () => {
      expect(removeTrailingSlash('/')).toBe('/')
    })

    it('should not modify strings without trailing slash', () => {
      expect(removeTrailingSlash('https://example.com')).toBe('https://example.com')
    })
  })

  describe('filterPublicPosts', () => {
    it('should filter out draft, password, and hide posts', () => {
      const posts = [
        { data: { title: 'Public' }, content: '', filePath: 'a.md' },
        { data: { title: 'Draft', draft: true }, content: '', filePath: 'b.md' },
        { data: { title: 'Encrypted', password: 'x' }, content: '', filePath: 'c.md' },
        { data: { title: 'Hidden', hide: true }, content: '', filePath: 'd.md' },
        { data: { title: 'HideIndex', hide: 'index' }, content: '', filePath: 'e.md' },
      ]
      const result = filterPublicPosts(posts)
      expect(result).toHaveLength(1)
      expect(result[0].data.title).toBe('Public')
    })
  })
})
