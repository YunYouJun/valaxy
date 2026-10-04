import type { ViteDevToolsNodeContext } from '@vitejs/devtools-kit'
import type { ValaxyDevtoolsOptions } from '../../packages/devtools/src/node/types'
import childProcess from 'node:child_process'
import { EventEmitter } from 'node:events'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { setImmediate } from 'node:timers/promises'
import { createOpenService } from '@devframes/service-open'
import { createShikiService } from '@devframes/service-shiki'
import { createKitContext } from '@vitejs/devtools-kit/node'
import { normalize } from 'pathe'
import { resolveConfig } from 'vite'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ValaxyDevtools from '../../packages/devtools/src/node'
import { defineValaxyDevtoolsPlugin } from '../../packages/devtools/src/plugin'

let root: string
let site: string
let ctx: ViteDevToolsNodeContext
const cleanups: (() => Promise<void>)[] = []

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'valaxy-vite-services-'))
  site = join(root, 'blog')
  const workspace = join(root, 'host')
  await Promise.all([mkdir(site), mkdir(workspace)])
  await writeFile(join(site, 'valaxy.config.ts'), 'export default {}\n')
  const config = await resolveConfig({ configFile: false, root: workspace, devtools: false }, 'serve')
  ctx = await createKitContext({
    cwd: workspace,
    mode: 'dev',
    viteConfig: config,
    host: {
      mountStatic() {},
      mountConnectionMeta() {},
      resolveOrigin: () => 'http://localhost:5173',
      getStorageDir: scope => join(root, 'state', scope),
    },
  }) as ViteDevToolsNodeContext
  vi.stubEnv('LAUNCH_EDITOR', 'code')
})

afterEach(async () => {
  await Promise.all(cleanups.splice(0).map(cleanup => cleanup()))
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  await rm(root, { recursive: true, force: true })
})

async function start(options: ValaxyDevtoolsOptions = {}) {
  const plugin = ValaxyDevtools({ userRoot: site, ...options })
  cleanups.push(async () => {
    if (typeof plugin.closeBundle === 'function')
      await plugin.closeBundle.call({} as never)
  })
  await plugin.devtools!.setup(ctx)
}

describe('vite hosted DevTools services', () => {
  it('reuses the host open service and keeps its policy and per-call editor selection', async () => {
    const installed = ctx.services.install(createOpenService({ editor: 'zed', roots: [site] }))
    const shiki = ctx.services.install(createShikiService())
    await ctx.services.ready()
    const original = await installed
    await shiki
    const install = vi.spyOn(ctx.services, 'install')
    await start()
    expect(install).not.toHaveBeenCalled()
    expect(ctx.services.get('@devframes/service-open')).toBe(original)

    const child = new EventEmitter() as ReturnType<typeof childProcess.spawn>
    const spawn = vi.spyOn(childProcess, 'spawn').mockReturnValue(child)
    const exec = vi.spyOn(childProcess, 'exec').mockReturnValue(child)
    const path = normalize(join(site, 'valaxy.config.ts'))
    const options = await ctx.rpc.invokeLocal('valaxy:get-options')
    expect(options.editor).toBe('code')
    await ctx.rpc.invokeLocal('devframes:service:open:open-in-editor', { path, editor: options.editor })
    if (process.platform === 'win32')
      expect(exec).toHaveBeenLastCalledWith(expect.stringContaining('code'), expect.anything())
    else
      expect(spawn).toHaveBeenLastCalledWith('code', expect.arrayContaining([path]), { stdio: 'inherit' })
    child.emit('exit', 0)
    await ctx.rpc.invokeLocal('devframes:service:open:open-in-editor', { path })
    if (process.platform === 'win32')
      expect(exec).toHaveBeenLastCalledWith(expect.stringContaining('zed'), expect.anything())
    else
      expect(spawn).toHaveBeenLastCalledWith('zed', expect.arrayContaining([path]), { stdio: 'inherit' })
    child.emit('exit', 0)
    await expect(ctx.rpc.invokeLocal('devframes:service:open:open-in-editor', { path: join(root, 'outside.ts') })).rejects.toThrow()
  })

  it('installs missing services once before extensions run', async () => {
    const install = vi.spyOn(ctx.services, 'install')
    const setup = vi.fn(() => {
      expect(ctx.services.has('@devframes/service-open')).toBe(true)
      expect(ctx.services.has('@devframes/service-shiki')).toBe(true)
    })
    await start({ plugins: [defineValaxyDevtoolsPlugin({ apiVersion: 1, id: 'test', name: 'Test', setup })] })
    expect(install.mock.calls.map(([input]) => input.package)).toEqual(['@devframes/service-shiki', '@devframes/service-open'])
    expect(setup).toHaveBeenCalledOnce()
  })

  it('does not widen an existing host service to include a blog outside its roots', async () => {
    const installed = ctx.services.install(createOpenService())
    await ctx.services.ready()
    await installed
    await start()
    await expect(ctx.rpc.invokeLocal('devframes:service:open:open-in-editor', {
      path: join(site, 'valaxy.config.ts'),
      editor: 'code',
    })).rejects.toThrow(/outside the workspace root/)
  })

  it('awaits its own installation promises after the host ready barrier', async () => {
    await ctx.services.ready()
    const started = Promise.withResolvers<void>()
    const release = Promise.withResolvers<void>()
    const install = ctx.services.install.bind(ctx.services)
    vi.spyOn(ctx.services, 'install').mockImplementation(async (input, options) => {
      const service = await install(input, options)
      started.resolve()
      await release.promise
      return service
    })
    const setup = vi.fn()
    const starting = start({ plugins: [defineValaxyDevtoolsPlugin({ apiVersion: 1, id: 'test', name: 'Test', setup })] })
    try {
      await started.promise
      await setImmediate()
      expect(setup).not.toHaveBeenCalled()
    }
    finally {
      release.resolve()
      await starting
    }
    expect(setup).toHaveBeenCalledOnce()
  })

  it('waits for the host initial service batch before checking for missing services', async () => {
    const started = Promise.withResolvers<void>()
    const release = Promise.withResolvers<void>()
    const open = createOpenService({ editor: 'zed', roots: [site] })
    const installed = ctx.services.install({
      ...open,
      async setup(context, options) {
        started.resolve()
        await release.promise
        return open.setup(context, options)
      },
    })
    const ready = ctx.services.ready()
    await started.promise
    const install = vi.spyOn(ctx.services, 'install')
    const starting = start()
    const completed = Promise.allSettled([ready, installed, starting])
    try {
      await setImmediate()
      expect(install).not.toHaveBeenCalled()
    }
    finally {
      release.resolve()
      await completed
    }
    expect((await completed).every(result => result.status === 'fulfilled')).toBe(true)
    expect(install.mock.calls.map(([input]) => input.package)).toEqual(['@devframes/service-shiki'])
  })

  it('propagates installation failures before starting extensions', async () => {
    const error = new Error('Service installation failed')
    vi.spyOn(ctx.services, 'install').mockRejectedValue(error)
    const setup = vi.fn()
    await expect(start({ plugins: [defineValaxyDevtoolsPlugin({ apiVersion: 1, id: 'test', name: 'Test', setup })] })).rejects.toBe(error)
    expect(setup).not.toHaveBeenCalled()
  })
})
