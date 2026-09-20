import type { ViteDevServer } from 'vite'
import type { ResolvedValaxyOptions } from '../packages/valaxy/node/types'
import { EventEmitter } from 'node:events'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import fs from 'fs-extra'
import { expect, it, vi } from 'vitest'
import { localSearchPlugin } from '../packages/valaxy/node/plugins/localSearchPlugin'

it('indexes generated shared pages in each locale and updates additions/deletions', async () => {
  const root = await mkdtemp(resolve(tmpdir(), 'valaxy-generated-search-'))
  const file = resolve(root, '.valaxy/content/pages/api/read.md')
  try {
    await fs.outputFile(file, '---\nsharedLocale: true\n---\n# read\n\nRead a cached value.')
    await fs.outputFile(resolve(root, '.valaxy/content/pages/api/private.md'), '---\npassword: secret\n---\n# Private\n\nHiddenToken')
    const options = { userRoot: root, config: { siteConfig: { search: { provider: 'local' }, languages: ['en', 'zh'] }, vite: {}, features: { katex: false } } } as unknown as ResolvedValaxyOptions
    const plugin = await localSearchPlugin(options)
    const watcher = new EventEmitter()
    const server = { watcher, httpServer: new EventEmitter(), moduleGraph: { onFileChange() {}, getModuleById() {} }, config: { logger: { error: vi.fn() } } } as unknown as ViteDevServer
    await (plugin.configureServer as (server: ViteDevServer) => Promise<void>)(server)
    const load = plugin.load as (id: string) => Promise<string>
    expect(await load('/@localSearchIndex')).toContain('@localSearchIndexzh')
    const chinese = await load('/@localSearchIndexzh')
    expect(chinese).toContain('/api/read.html#read')
    expect(chinese).not.toContain('HiddenToken')
    const added = resolve(root, '.valaxy/content/pages/api/write.md')
    await fs.outputFile(added, '---\nsharedLocale: true\n---\n# write\n\nWrite a value.')
    watcher.emit('add', added)
    await vi.waitFor(async () => expect(await load('/@localSearchIndexzh')).toContain('/api/write.html#write'))
    await fs.remove(file)
    watcher.emit('unlink', file)
    await vi.waitFor(async () => expect(await load('/@localSearchIndexzh')).not.toContain('/api/read.html#read'))
    server.httpServer!.emit('close')
    expect(watcher.listenerCount('add')).toBe(0)
  }
  finally {
    await fs.remove(root)
  }
})
