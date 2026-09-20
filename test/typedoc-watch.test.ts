import type { Plugin, ViteDevServer } from 'vite'
import type { ValaxyNode } from '../packages/valaxy/node/types'
import { EventEmitter } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { expect, it, vi } from 'vitest'
import { addonTypeDoc } from '../packages/valaxy-addon-typedoc/node'

const mocks = vi.hoisted(() => ({ load: vi.fn() }))
vi.mock('valaxy', () => ({ defineValaxyAddon: (factory: unknown) => factory, loadAllContent: mocks.load }))

it('debounces source changes, serializes generations and releases the watcher', async () => {
  const userRoot = await mkdtemp(resolve(tmpdir(), 'typedoc-watch-'))
  const tick = () => new Promise(accept => setTimeout(accept, 300))
  try {
    const node = { options: { userRoot, tempDir: resolve(userRoot, '.valaxy'), config: {} }, hooks: { callHook: vi.fn() } } as unknown as ValaxyNode
    await addonTypeDoc({ options: 'typedoc.json', watch: ['src/**/*.ts', '*.json'] }).setup!(node)
    const plugin = node.options.config.vite!.plugins![0] as Plugin
    const watcher = Object.assign(new EventEmitter(), { add: vi.fn() })
    const server = { watcher, httpServer: new EventEmitter(), moduleGraph: { getModuleById: vi.fn() }, ws: { send: vi.fn() }, config: { logger: { error: vi.fn() } } } as unknown as ViteDevServer
    await (plugin.configureServer as (server: ViteDevServer) => Promise<void>)(server)
    const release: (() => void)[] = []
    mocks.load.mockImplementation(() => new Promise<void>(accept => release.push(accept)))
    watcher.emit('change', resolve(userRoot, 'pages/guide.md'))
    watcher.emit('change', resolve(userRoot, '.valaxy/content/cache.json'))
    await tick()
    expect(mocks.load).not.toHaveBeenCalled()

    for (let i = 0; i < 3; i++)
      watcher.emit('change', resolve(userRoot, 'src/index.ts'))
    await tick()
    expect(mocks.load).toHaveBeenCalledTimes(1)
    watcher.emit('add', resolve(userRoot, 'src/added.ts'))
    await tick()
    expect(mocks.load).toHaveBeenCalledTimes(1)
    release.shift()!()
    await vi.waitFor(() => expect(mocks.load).toHaveBeenCalledTimes(2))
    release.shift()!()
    await vi.waitFor(() => expect(server.ws.send).toHaveBeenCalledTimes(2))
    server.httpServer!.emit('close')
    watcher.emit('change', resolve(userRoot, 'src/index.ts'))
    await tick()
    expect(mocks.load).toHaveBeenCalledTimes(2)
    expect(watcher.listenerCount('change')).toBe(0)
  }
  finally {
    await rm(userRoot, { recursive: true, force: true })
  }
})
