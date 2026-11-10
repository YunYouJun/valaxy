import type { HmrContext, ViteDevServer } from 'vite'
import type { ResolvedValaxyOptions } from '../packages/valaxy/node/types'
import type { PagePublishing } from '../packages/valaxy/shared/page-policy'
import { EventEmitter } from 'node:events'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import fs from 'fs-extra'
import { describe, expect, it, vi } from 'vitest'
import { localSearchPlugin } from '../packages/valaxy/node/plugins/localSearchPlugin'

async function createSearch(root: string, publishing?: PagePublishing, frontmatter?: Record<string, unknown>) {
  const options = {
    userRoot: root,
    config: {
      siteConfig: { search: { provider: 'local' }, languages: ['en', 'zh'], publishing, frontmatter },
      vite: {},
      features: { katex: false },
    },
  } as unknown as ResolvedValaxyOptions
  const plugin = await localSearchPlugin(options)
  const server = {
    watcher: new EventEmitter(),
    httpServer: new EventEmitter(),
    moduleGraph: { onFileChange() {}, getModuleById() {} },
    config: { logger: { error: vi.fn() } },
  } as unknown as ViteDevServer
  await (plugin.configureServer as (server: ViteDevServer) => Promise<void>)(server)
  return {
    load: plugin.load as (id: string) => Promise<string>,
    update: (file: string) => (plugin.handleHotUpdate as (ctx: HmrContext) => Promise<void>)({ file } as HmrContext),
    close: () => server.httpServer!.emit('close'),
  }
}

function markdown(title: string, frontmatter = '') {
  return `---\nsharedLocale: true\n${frontmatter}\n---\n# ${title}\n\n${title} searchable body.\n`
}

const publishingCases: Array<[string, PagePublishing | undefined]> = [
  ['defaults', undefined],
  ['draft opt-in', { drafts: true }],
  ['underscore opt-in', { underscore: true }],
  ['README opt-in', { readme: true }],
  ['all opt-ins', { drafts: true, underscore: true, readme: true }],
]

describe.each(['pages', '.valaxy/content/pages'])('local search publishing in %s', (source) => {
  it.each(publishingCases)('respects %s independently and keeps privacy exclusions', async (_, publishing) => {
    const root = await mkdtemp(resolve(tmpdir(), 'valaxy-search-publishing-'))
    let search: Awaited<ReturnType<typeof createSearch>> | undefined
    try {
      const pages = [
        ['public.md', 'PublicToken', '', true],
        ['draft.md', 'DraftToken', 'draft: true', !!publishing?.drafts],
        ['_private.md', 'UnderscoreToken', '', !!publishing?.underscore],
        ['nested/_private/page.md', 'NestedToken', '', !!publishing?.underscore],
        ['nested/rEaDmE.md', 'ReadmeToken', '', !!publishing?.readme],
        ['_private/README.md', 'CombinedToken', 'draft: true', !!(publishing?.drafts && publishing.underscore && publishing.readme)],
        ['hidden.md', 'HiddenToken', 'hide: true', false],
        ['unsearchable.md', 'UnsearchableToken', 'search: false', false],
        ['password.md', 'PasswordToken', 'password: secret', false],
        ['encrypted.md', 'EncryptedToken', 'encrypt: true', false],
      ] as const
      for (const [file, title, frontmatter] of pages)
        await fs.outputFile(resolve(root, source, file), markdown(title, frontmatter))
      search = await createSearch(root, publishing)
      for (const locale of ['root', 'en', 'zh']) {
        const index = await search.load(`/@localSearchIndex${locale}`)
        for (const [, title, , included] of pages) {
          if (included)
            expect(index).toContain(title)
          else
            expect(index).not.toContain(title)
        }
      }
    }
    finally {
      search?.close()
      await fs.remove(root)
    }
  })

  it.each([
    [{ draft: true }, 'draft: false'],
    [{ hide: true }, 'hide: false'],
    [{ search: false }, 'search: true'],
    [{ password: 'secret' }, 'password: false'],
    [{ encrypt: true }, 'encrypt: false'],
  ])('respects global frontmatter %j and per-page overrides', async (frontmatter, override) => {
    const root = await mkdtemp(resolve(tmpdir(), 'valaxy-search-defaults-'))
    let search: Awaited<ReturnType<typeof createSearch>> | undefined
    try {
      await fs.outputFile(resolve(root, source, 'private.md'), markdown('DefaultPrivateToken'))
      await fs.outputFile(resolve(root, source, 'public.md'), markdown('ExplicitPublicToken', override))
      search = await createSearch(root, undefined, frontmatter)
      const index = await search.load('/@localSearchIndexroot')
      expect(index.toLowerCase()).not.toContain('defaultprivatetoken')
      expect(index).toContain('ExplicitPublicToken')
    }
    finally {
      search?.close()
      await fs.remove(root)
    }
  })

  it('removes newly private content from every locale during HMR', async () => {
    const root = await mkdtemp(resolve(tmpdir(), 'valaxy-search-hmr-'))
    const file = resolve(root, source, 'changing.md')
    let search: Awaited<ReturnType<typeof createSearch>> | undefined
    try {
      await fs.outputFile(file, markdown('ChangingToken'))
      search = await createSearch(root)
      for (const privacy of ['draft: true', 'hide: true', 'search: false', 'password: secret', 'encrypt: true']) {
        await fs.outputFile(file, markdown('ChangingToken'))
        await search.update(file)
        for (const locale of ['root', 'en', 'zh'])
          expect(await search.load(`/@localSearchIndex${locale}`)).toContain('ChangingToken')
        await fs.outputFile(file, markdown('ChangingToken', privacy))
        await search.update(file)
        for (const locale of ['root', 'en', 'zh'])
          expect((await search.load(`/@localSearchIndex${locale}`)).toLowerCase()).not.toContain('changingtoken')
      }
    }
    finally {
      search?.close()
      await fs.remove(root)
    }
  })

  it('never indexes partial encryption, including included fragments', async () => {
    const root = await mkdtemp(resolve(tmpdir(), 'valaxy-search-encryption-'))
    let search: Awaited<ReturnType<typeof createSearch>> | undefined
    try {
      const partial = '<!-- valaxy-encrypt-start:secret -->\n# SecretToken\n\nClassifiedToken\n<!-- valaxy-encrypt-end -->'
      await fs.outputFile(resolve(root, source, 'fragment.txt'), `${partial}\n\nVisibleFragmentToken`)
      await fs.outputFile(resolve(root, source, 'partial.md'), `${markdown('PublicToken')}\n${partial}\n\n<!-- @include: fragment.txt -->\n\n<!-- valaxy-encrypt-start:secret -->\nUnclosedToken`)
      search = await createSearch(root)
      const index = await search.load('/@localSearchIndexroot')
      expect(index).toContain('PublicToken')
      expect(index).toContain('visiblefragmenttoken')
      for (const token of ['secrettoken', 'classifiedtoken', 'unclosedtoken'])
        expect(index.toLowerCase()).not.toContain(token)
    }
    finally {
      search?.close()
      await fs.remove(root)
    }
  })
})
