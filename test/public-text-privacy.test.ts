import type { ViteDevServer } from 'vite'
import type { ResolvedValaxyOptions } from '../packages/valaxy/node/types'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import fs from 'fs-extra'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { generateFuseList } from '../packages/valaxy/node/modules/fuse'
import { build, loadLlmsPosts } from '../packages/valaxy/node/modules/llms/utils'
import { createLlmsPlugin } from '../packages/valaxy/node/plugins/llms'

let root: string
let options: ResolvedValaxyOptions

async function write(page: string, metadata: string, content: string, generated = false) {
  await fs.outputFile(resolve(root, generated ? '.valaxy/content/pages' : 'pages', page), `---\n${metadata}\n---\n${content}`)
}

async function serve(url: string) {
  let middleware: any
  const plugin = createLlmsPlugin(options)!
  const server = {
    middlewares: {
      use(fn: any) {
        middleware = fn
      },
    },
  } as unknown as ViteDevServer
  await (plugin.configureServer as (server: ViteDevServer) => void)(server)
  const next = vi.fn()
  const response = { setHeader: vi.fn(), end: vi.fn(), statusCode: 0 }
  await middleware({ url, method: 'GET' }, response, next)
  return { body: response.end.mock.calls[0]?.[0] as string | undefined, next }
}

beforeEach(async () => {
  root = await mkdtemp(resolve(tmpdir(), 'valaxy-public-text-'))
  options = {
    userRoot: root,
    config: {
      siteConfig: {
        title: 'Public site',
        description: 'Public description',
        url: 'https://example.com',
        lang: 'en',
        author: { name: 'Writer' },
        frontmatter: {},
        fuse: { options: { keys: ['title', 'content'] } },
        llms: { enable: true, fullText: true, files: true, include: ['**/*.md'], prompt: '' },
      },
      fuse: { extendKeys: ['description', 'password', 'gallery_password', 'photos', 'encryptedContent'] },
    },
  } as unknown as ResolvedValaxyOptions
})

afterEach(async () => {
  await fs.remove(root)
})

describe('public text privacy', () => {
  it('keeps partial blocks and passwords out of search, generated files, and dev responses', async () => {
    const body = 'Public beginning.\n<!-- valaxy-encrypt-start:SECRET_PASSWORD -->\nSECRET_BEFORE_MORE\n<!-- more -->\nSECRET_AFTER_MORE\n<!-- valaxy-encrypt-end -->\nPublic ending.'
    for (const generated of [false, true]) {
      const prefix = generated ? 'generated' : 'posts'
      await write(`${prefix}/partial.md`, 'title: Partial\ndescription: Explicit public metadata\ngallery_password: SECRET_GALLERY_PASSWORD\nphotos: [SECRET_PHOTO]\nencryptedContent: SECRET_CIPHER', body, generated)
      await write(`${prefix}/encrypted.md`, 'title: Encrypted\nencrypt: true', 'SECRET_ENTIRE_BODY', generated)
      await write(`${prefix}/password.md`, 'title: Password\npassword: SECRET_PAGE_PASSWORD', 'SECRET_PASSWORD_BODY', generated)
    }

    const fuse = await generateFuseList(options)
    expect(fuse).toHaveLength(2)
    for (const item of fuse) {
      expect(item.content).toContain('Public ending.')
      expect(item.excerpt).toContain('Public ending.')
      expect(item.description).toBe('Explicit public metadata')
    }
    expect(JSON.stringify(fuse)).not.toContain('SECRET_')

    await build(options)
    for (const file of ['llms.txt', 'llms-full.txt', 'posts/partial.md', 'generated/partial.md']) {
      const output = await fs.readFile(resolve(root, 'dist', file), 'utf8')
      expect(output).not.toContain('SECRET_')
      expect(output).toContain('Explicit public metadata')
    }
    for (const prefix of ['posts', 'generated']) {
      expect(await fs.pathExists(resolve(root, 'dist', prefix, 'encrypted.md'))).toBe(false)
      expect(await fs.pathExists(resolve(root, 'dist', prefix, 'password.md'))).toBe(false)
      const partial = await serve(`/${prefix}/partial.md`)
      expect(partial.body).toContain('Public ending.')
      expect(partial.body).not.toContain('SECRET_')
      for (const name of ['encrypted', 'password']) {
        const blocked = await serve(`/${prefix}/${name}.md`)
        expect(blocked.body).toBeUndefined()
        expect(blocked.next).toHaveBeenCalledWith()
      }
    }
    expect((await serve('/llms-full.txt')).body).not.toContain('SECRET_')
  })

  it.each(['encrypt', 'password', 'hide', 'draft'])('merges inherited %s protection and honors explicit overrides', async (key) => {
    options.config.siteConfig.frontmatter = { [key]: key === 'password' ? 'SECRET_GLOBAL_PASSWORD' : true }
    await write('posts/inherited.md', 'title: Inherited', 'SECRET_INHERITED_BODY')
    await write('posts/override.md', `title: Override\n${key}: false`, 'Explicit public body', true)
    const fuse = await generateFuseList(options)
    expect(fuse.map(item => item.title)).toEqual(['Override'])
    expect((await loadLlmsPosts(options)).map(item => item.title)).toEqual(['Override'])
    expect((await serve('/posts/inherited.md')).body).toBeUndefined()
    expect((await serve('/posts/override.md')).body).toContain('Explicit public body')
    await build(options)
    expect(await fs.pathExists(resolve(root, 'dist/posts/inherited.md'))).toBe(false)
    expect(await fs.readFile(resolve(root, 'dist/posts/override.md'), 'utf8')).not.toContain('SECRET_')
    if (key === 'draft') {
      options.config.siteConfig.publishing = { drafts: true, underscore: false, readme: false }
      expect(await generateFuseList(options)).toHaveLength(2)
      expect(await loadLlmsPosts(options)).toHaveLength(2)
      expect((await serve('/posts/inherited.md')).body).toContain('SECRET_INHERITED_BODY')
    }
  })

  it('does not close private blocks on lookalike closing markers or truncated excerpts', async () => {
    await write('posts/lookalike.md', 'title: Lookalike', 'Public.\n<!-- valaxy-encrypt-start:key -->\nSECRET_FIRST\n<!--valaxy-encrypt-end-->\nSECRET_SECOND\n<!-- more -->\nSECRET_THIRD')
    await write('posts/normal.md', 'title: Normal', 'Public excerpt.\n<!-- more -->\nPublic remainder.')
    const fuse = await generateFuseList(options)
    expect(JSON.stringify(fuse)).not.toContain('SECRET_')
    expect(fuse.find(item => item.title === 'Normal')?.excerpt).toBe('Public excerpt.\n')
    expect(JSON.stringify(await loadLlmsPosts(options))).not.toContain('SECRET_')
    expect((await serve('/posts/lookalike.md')).body).not.toContain('SECRET_')
  })
})
