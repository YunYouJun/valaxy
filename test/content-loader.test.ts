import type { ContentItem, ContentLoader, ContentLoaderContext, ValaxyNode } from '../packages/valaxy/node'
import { resolve } from 'node:path'
import fs from 'fs-extra'
import { createHooks } from 'hookable'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadAllContent } from '../packages/valaxy/node/modules/content'
import { defineContentLoader } from '../packages/valaxy/node/types/loader'

const tmpDir = resolve(__dirname, '.tmp-content-loader-test')

function createMockCtx(overrides?: Partial<ContentLoaderContext>): ContentLoaderContext {
  return {
    node: {
      version: '0.0.0',
      hooks: createHooks(),
      hook: vi.fn(),
      options: {} as any,
    } as ValaxyNode,
    cacheDir: resolve(tmpDir, 'content'),
    mode: 'dev',
    ...overrides,
  }
}

afterEach(async () => {
  await fs.remove(tmpDir)
})

describe('defineContentLoader', () => {
  it('returns the same loader object', () => {
    const loader: ContentLoader = {
      name: 'test',
      load: () => [],
    }
    expect(defineContentLoader(loader)).toBe(loader)
  })
})

describe('loadAllContent', () => {
  it('writes .md files to the cache directory', async () => {
    const ctx = createMockCtx()
    const loaders: ContentLoader[] = [
      defineContentLoader({
        name: 'mock',
        async load() {
          return [
            {
              path: 'posts/hello.md',
              content: '---\ntitle: Hello\n---\nHello world!',
            },
            {
              path: 'posts/nested/deep.md',
              content: '---\ntitle: Deep\n---\nNested content',
            },
          ]
        },
      }),
    ]

    await loadAllContent(loaders, ctx)

    const pagesDir = resolve(ctx.cacheDir, 'pages')
    expect(await fs.pathExists(resolve(pagesDir, 'posts/hello.md'))).toBe(true)
    expect(await fs.pathExists(resolve(pagesDir, 'posts/nested/deep.md'))).toBe(true)

    const content = await fs.readFile(resolve(pagesDir, 'posts/hello.md'), 'utf-8')
    expect(content).toBe('---\ntitle: Hello\n---\nHello world!')
  })

  it('uses incremental caching to skip unchanged files', async () => {
    const ctx = createMockCtx()
    const items: ContentItem[] = [
      {
        path: 'posts/cached.md',
        content: '---\ntitle: Cached\n---\nSame content',
      },
    ]

    const loader = defineContentLoader({
      name: 'cache-test',
      load: () => items,
    })

    // First run - should write
    await loadAllContent([loader], ctx)
    const filePath = resolve(ctx.cacheDir, 'pages', 'posts/cached.md')
    const stat1 = await fs.stat(filePath)

    // Small delay to ensure different mtime if file were rewritten
    await new Promise(r => setTimeout(r, 50))

    // Second run with same content - should skip write
    await loadAllContent([loader], ctx)
    const stat2 = await fs.stat(filePath)

    // mtime should be unchanged since file was not rewritten
    expect(stat2.mtimeMs).toBe(stat1.mtimeMs)
  })

  it('removes stale files when items are removed from loader output', async () => {
    const ctx = createMockCtx()

    const firstItems: ContentItem[] = [
      { path: 'posts/keep.md', content: '---\ntitle: Keep\n---\nKeep' },
      { path: 'posts/remove.md', content: '---\ntitle: Remove\n---\nRemove' },
    ]

    const loader = defineContentLoader({
      name: 'stale-test',
      load: () => firstItems,
    })

    await loadAllContent([loader], ctx)

    const pagesDir = resolve(ctx.cacheDir, 'pages')
    expect(await fs.pathExists(resolve(pagesDir, 'posts/remove.md'))).toBe(true)

    // Second run - only returns 'keep.md'
    const secondItems: ContentItem[] = [
      { path: 'posts/keep.md', content: '---\ntitle: Keep\n---\nKeep' },
    ]
    const loader2 = defineContentLoader({
      name: 'stale-test',
      load: () => secondItems,
    })

    await loadAllContent([loader2], ctx)

    expect(await fs.pathExists(resolve(pagesDir, 'posts/keep.md'))).toBe(true)
    expect(await fs.pathExists(resolve(pagesDir, 'posts/remove.md'))).toBe(false)
  })

  it('applies transform to items before writing', async () => {
    const ctx = createMockCtx()
    const loader = defineContentLoader({
      name: 'transform-test',
      load: () => [
        { path: 'posts/raw.md', content: 'raw content' },
      ],
      transform: (item) => {
        return {
          ...item,
          content: `---\ntitle: Transformed\n---\n${item.content}`,
        }
      },
    })

    await loadAllContent([loader], ctx)

    const content = await fs.readFile(
      resolve(ctx.cacheDir, 'pages', 'posts/raw.md'),
      'utf-8',
    )
    expect(content).toBe('---\ntitle: Transformed\n---\nraw content')
  })

  it('continues loading other items when transform fails for one', async () => {
    const ctx = createMockCtx()
    const loader = defineContentLoader({
      name: 'transform-fail-test',
      load: () => [
        { path: 'posts/bad.md', content: 'bad' },
        { path: 'posts/good.md', content: '---\ntitle: Good\n---\nGood' },
      ],
      transform: (item) => {
        if (item.path.includes('bad'))
          throw new Error('transform failed')
        return item
      },
    })

    await loadAllContent([loader], ctx)

    const pagesDir = resolve(ctx.cacheDir, 'pages')
    expect(await fs.pathExists(resolve(pagesDir, 'posts/bad.md'))).toBe(false)
    expect(await fs.pathExists(resolve(pagesDir, 'posts/good.md'))).toBe(true)
  })

  it('continues with next loader when one fails to load', async () => {
    const ctx = createMockCtx()
    const loaders: ContentLoader[] = [
      defineContentLoader({
        name: 'failing-loader',
        load: () => { throw new Error('load failed') },
      }),
      defineContentLoader({
        name: 'working-loader',
        load: () => [
          { path: 'posts/works.md', content: '---\ntitle: Works\n---\nContent' },
        ],
      }),
    ]

    await loadAllContent(loaders, ctx)

    expect(await fs.pathExists(resolve(ctx.cacheDir, 'pages', 'posts/works.md'))).toBe(true)
  })

  it('respects custom digest for caching', async () => {
    const ctx = createMockCtx()
    let callCount = 0

    const loader = defineContentLoader({
      name: 'digest-test',
      load: () => {
        callCount++
        return [{
          path: 'posts/digest.md',
          content: `---\ntitle: Digest ${callCount}\n---\nContent ${callCount}`,
          digest: 'fixed-digest',
        }]
      },
    })

    await loadAllContent([loader], ctx)
    const content1 = await fs.readFile(
      resolve(ctx.cacheDir, 'pages', 'posts/digest.md'),
      'utf-8',
    )

    // Second run with different content but same digest - should skip write
    await loadAllContent([loader], ctx)
    const content2 = await fs.readFile(
      resolve(ctx.cacheDir, 'pages', 'posts/digest.md'),
      'utf-8',
    )

    // Content should be from first write since digest didn't change
    expect(content2).toBe(content1)
  })

  it('rejects absolute paths', async () => {
    const ctx = createMockCtx()
    const loader = defineContentLoader({
      name: 'abs-path-test',
      load: () => [
        { path: '/etc/passwd.md', content: 'malicious' },
        { path: 'posts/good.md', content: '---\ntitle: Good\n---\nGood' },
      ],
    })

    await loadAllContent([loader], ctx)

    const pagesDir = resolve(ctx.cacheDir, 'pages')
    expect(await fs.pathExists(resolve(pagesDir, 'posts/good.md'))).toBe(true)
    // Absolute path should be rejected
    expect(await fs.pathExists('/etc/passwd.md')).toBe(false)
  })

  it('rejects paths with .. traversal', async () => {
    const ctx = createMockCtx()
    const loader = defineContentLoader({
      name: 'traversal-test',
      load: () => [
        { path: '../../../etc/passwd.md', content: 'malicious' },
        { path: 'posts/../../../escape.md', content: 'malicious' },
        { path: 'posts/good.md', content: '---\ntitle: Good\n---\nGood' },
      ],
    })

    await loadAllContent([loader], ctx)

    const pagesDir = resolve(ctx.cacheDir, 'pages')
    expect(await fs.pathExists(resolve(pagesDir, 'posts/good.md'))).toBe(true)
  })

  it('rejects non-.md file paths', async () => {
    const ctx = createMockCtx()
    const loader = defineContentLoader({
      name: 'ext-test',
      load: () => [
        { path: 'posts/script.js', content: 'alert(1)' },
        { path: 'posts/data.json', content: '{}' },
        { path: 'posts/good.md', content: '---\ntitle: Good\n---\nGood' },
      ],
    })

    await loadAllContent([loader], ctx)

    const pagesDir = resolve(ctx.cacheDir, 'pages')
    expect(await fs.pathExists(resolve(pagesDir, 'posts/script.js'))).toBe(false)
    expect(await fs.pathExists(resolve(pagesDir, 'posts/data.json'))).toBe(false)
    expect(await fs.pathExists(resolve(pagesDir, 'posts/good.md'))).toBe(true)
  })

  it('normalizes equivalent paths for manifest consistency', async () => {
    const ctx = createMockCtx()

    // First run with non-canonical path
    const loader1 = defineContentLoader({
      name: 'normalize-test',
      load: () => [
        { path: './posts/hello.md', content: '---\ntitle: Hello\n---\nContent' },
      ],
    })
    await loadAllContent([loader1], ctx)

    const filePath = resolve(ctx.cacheDir, 'pages', 'posts/hello.md')
    expect(await fs.pathExists(filePath)).toBe(true)
    const stat1 = await fs.stat(filePath)

    await new Promise(r => setTimeout(r, 50))

    // Second run with canonical path but same content — should use cache
    const loader2 = defineContentLoader({
      name: 'normalize-test',
      load: () => [
        { path: 'posts/hello.md', content: '---\ntitle: Hello\n---\nContent' },
      ],
    })
    await loadAllContent([loader2], ctx)

    const stat2 = await fs.stat(filePath)
    expect(stat2.mtimeMs).toBe(stat1.mtimeMs)
  })
})
