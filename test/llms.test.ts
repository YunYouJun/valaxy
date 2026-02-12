import type { ResolvedValaxyOptions } from '../packages/valaxy/node'
import { resolve } from 'node:path'
import fs from 'fs-extra'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { build } from '../packages/valaxy/node/modules/llms/utils'

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
}> = {}): ResolvedValaxyOptions {
  return {
    userRoot: mockUserRoot,
    config: {
      siteConfig: {
        url: overrides.url ?? 'https://example.com/',
        lang: overrides.lang ?? 'en',
        title: overrides.title ?? 'Test Blog',
        description: overrides.description ?? 'A test blog',
      },
      modules: {
        rss: {
          enable: true,
          fullText: false,
          extractImagePathsFromHTML: true,
        },
        llms: {
          enable: overrides.enable ?? true,
          fullText: overrides.fullText ?? true,
          files: overrides.files ?? true,
          prompt: overrides.prompt ?? '',
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
    it('should generate llms-full.txt with inlined content', async () => {
      await build(createMockOptions({ fullText: true }))

      const fullTxt = await fs.readFile(resolve(mockUserRoot, 'dist/llms-full.txt'), 'utf-8')

      expect(fullTxt).toContain('# Test Blog')
      expect(fullTxt).toContain('## Hello World')
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
    it('should copy raw .md files to dist', async () => {
      await build(createMockOptions({ files: true }))

      const helloMd = await fs.readFile(resolve(mockUserRoot, 'dist/posts/hello.md'), 'utf-8')
      expect(helloMd).toContain('# Hello World')
      expect(helloMd).toContain('This is my first post.')

      const secondMd = await fs.readFile(resolve(mockUserRoot, 'dist/posts/second.md'), 'utf-8')
      expect(secondMd).toContain('# Second Post')
    })

    it('should not copy .md files when files is false', async () => {
      await build(createMockOptions({ files: false }))

      const exists = await fs.pathExists(resolve(mockUserRoot, 'dist/posts/hello.md'))
      expect(exists).toBe(false)
    })

    it('should not copy draft/encrypted/hidden posts as .md', async () => {
      await build(createMockOptions({ files: true }))

      expect(await fs.pathExists(resolve(mockUserRoot, 'dist/posts/draft.md'))).toBe(false)
      expect(await fs.pathExists(resolve(mockUserRoot, 'dist/posts/encrypted.md'))).toBe(false)
      expect(await fs.pathExists(resolve(mockUserRoot, 'dist/posts/hidden.md'))).toBe(false)
    })
  })
})
