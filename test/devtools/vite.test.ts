import type { ViteDevToolsNodeContext } from '@vitejs/devtools-kit'
import type { DevframeServiceDefinition } from 'devframe/types'
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

vi.mock('@devframes/service-shiki', async (importOriginal) => {
  const original = await importOriginal<typeof import('@devframes/service-shiki')>()
  return { ...original, createShikiService: vi.fn(original.createShikiService) }
})

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
  it('keeps Valaxy editor settings separate from existing host services', async () => {
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
    await ctx.rpc.invokeLocal('valaxy:service:open:open-in-editor', { path, editor: options.editor })
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

  it('initializes private RPCs before extensions without installing shared services', async () => {
    const install = vi.spyOn(ctx.services, 'install')
    const setup = vi.fn(async () => {
      const result = await ctx.rpc.invokeLocal('valaxy:service:shiki:highlight', { code: '<script>', lang: 'text' })
      expect(result.html).toMatch(/(?:&lt;|&#(?:60|x3c);)script/i)
      expect(result.html).not.toContain('<script>')
      expect(result.html).toContain('--shiki-dark')
    })
    await start({ plugins: [defineValaxyDevtoolsPlugin({ apiVersion: 1, id: 'test', name: 'Test', setup })] })
    expect(install).not.toHaveBeenCalled()
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
    const child = new EventEmitter() as ReturnType<typeof childProcess.spawn>
    const spawn = vi.spyOn(childProcess, 'spawn').mockReturnValue(child)
    const exec = vi.spyOn(childProcess, 'exec').mockReturnValue(child)
    await ctx.rpc.invokeLocal('valaxy:service:open:open-in-editor', { path: join(site, 'valaxy.config.ts') })
    expect(process.platform === 'win32' ? exec : spawn).toHaveBeenCalledOnce()
    child.emit('exit', 0)
  })

  it('does not compete with host services still installing after the initial barrier', async () => {
    await ctx.services.ready()
    const release = Promise.withResolvers<void>()
    const definitions: DevframeServiceDefinition[] = [createOpenService(), createShikiService()]
    const started = definitions.map(() => Promise.withResolvers<void>())
    const pending = definitions.map((definition, index) => ctx.services.install({
      ...definition,
      async setup(context, options) {
        started[index]!.resolve()
        await release.promise
        return definition.setup(context, options)
      },
    }))
    await Promise.all(started.map(signal => signal.promise))
    const install = vi.spyOn(ctx.services, 'install')
    const completed = Promise.allSettled(pending)
    try {
      await start()
      expect(install).not.toHaveBeenCalled()
      const result = await ctx.rpc.invokeLocal('valaxy:service:shiki:highlight', { code: '{"ready": true}', lang: 'json' })
      expect(result.html).toContain('ready')
    }
    finally {
      release.resolve()
      await completed
    }
    expect((await completed).every(result => result.status === 'fulfilled')).toBe(true)
  })

  it('allows host services to install after Valaxy without RPC collisions', async () => {
    await start()
    const open = ctx.services.install(createOpenService())
    const shiki = ctx.services.install(createShikiService())
    await ctx.services.ready()
    await Promise.all([open, shiki])
    for (const method of ['valaxy:service:shiki:highlight', 'devframes:service:shiki:highlight'] as const) {
      const result = await ctx.rpc.invokeLocal(method, { code: 'const answer = 42', lang: 'typescript' })
      expect(result.html).toContain('answer')
    }
  })

  it('awaits its implementations before starting extensions', async () => {
    const started = Promise.withResolvers<void>()
    const release = Promise.withResolvers<void>()
    const shiki = createShikiService()
    vi.mocked(createShikiService).mockReturnValueOnce({
      ...shiki,
      async setup(context, options) {
        started.resolve()
        await release.promise
        return shiki.setup(context, options)
      },
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

  it('propagates initialization failures before starting extensions', async () => {
    const error = new Error('Service initialization failed')
    vi.mocked(createShikiService).mockReturnValueOnce({
      ...createShikiService(),
      setup() { throw error },
    })
    const setup = vi.fn()
    await expect(start({ plugins: [defineValaxyDevtoolsPlugin({ apiVersion: 1, id: 'test', name: 'Test', setup })] })).rejects.toBe(error)
    expect(setup).not.toHaveBeenCalled()
  })
})
