import type { DevframeNodeContext } from 'devframe'
import childProcess from 'node:child_process'
import { EventEmitter } from 'node:events'
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHostContext } from 'devframe/node'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createValaxyDevframe } from '../../packages/devtools/src/node/definition'
import { getEditorOptions } from '../../packages/devtools/src/node/editor'

let root: string
let site: string
let ctx: DevframeNodeContext
const child = new EventEmitter() as ReturnType<typeof childProcess.spawn>

beforeEach(async () => {
  // Exercise the real service and transport validation, stopping only OS launch.
  vi.spyOn(childProcess, 'spawn').mockReturnValue(child)
  vi.stubEnv('LAUNCH_EDITOR', 'code')
  root = await mkdtemp(join(tmpdir(), 'valaxy-editor-'))
  site = join(root, 'blog')
  await mkdir(site)
  await writeFile(join(site, 'valaxy.config.ts'), 'export default {}\n')
  const workspace = join(root, 'host')
  await mkdir(workspace)
  ctx = await createHostContext({
    cwd: workspace,
    mode: 'dev',
    host: {
      mountStatic() {},
      mountConnectionMeta() {},
      resolveOrigin: () => 'http://localhost:5173',
      getStorageDir: scope => join(root, 'state', scope),
    },
  })
  const definition = createValaxyDevframe({ userRoot: site })
  const service = definition.services!.find(service => service.package === '@devframes/service-open')!
  const installed = ctx.services.install(service, { resolveFrom: definition.importMetaUrl })
  // This fixture implements the adapter's pre-setup service barrier.
  await ctx.services.ready()
  await installed
  await definition.setup(ctx, { flags: {} })
})

afterEach(async () => {
  child.emit('exit', 0)
  child.removeAllListeners()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  await rm(root, { recursive: true, force: true })
})

describe('devTools Open service', () => {
  it('opens the blog outside the host root with the displayed default and per-call editor', async () => {
    const options = await ctx.rpc.invokeLocal('valaxy:get-options')
    expect(options.editor).toBe('code')
    expect(options.editors).toContain('cursor')
    const path = join(site, 'valaxy.config.ts')
    await ctx.rpc.invokeLocal('devframes:service:open:open-in-editor', { path, line: 3, column: 2 })
    expect(childProcess.spawn).toHaveBeenLastCalledWith('code', expect.arrayContaining(['-g', `${path}:3:2`]), { stdio: 'inherit' })
    child.emit('exit', 0)
    await ctx.rpc.invokeLocal('devframes:service:open:open-in-editor', { path, editor: 'cursor' })
    expect(childProcess.spawn).toHaveBeenLastCalledWith('cursor', expect.arrayContaining([path]), { stdio: 'inherit' })
  })

  it('rejects arbitrary commands and paths outside both permitted roots before launch', async () => {
    const outside = join(root, 'outside.ts')
    await writeFile(outside, 'untouched')
    await symlink(outside, join(site, 'escape.ts'))
    for (const path of [outside, '../outside.ts', join(site, 'escape.ts')])
      await expect(ctx.rpc.invokeLocal('devframes:service:open:open-in-editor', { path })).rejects.toThrow()
    // @ts-expect-error exercise the service's runtime editor allowlist
    await expect(ctx.rpc.invokeLocal('devframes:service:open:open-in-editor', { path: join(site, 'valaxy.config.ts'), editor: 'arbitrary-command' })).rejects.toThrow()
    expect(childProcess.spawn).not.toHaveBeenCalled()
  })

  it('uses environment precedence without guessing icons for custom or absent commands', () => {
    expect(getEditorOptions({ LAUNCH_EDITOR: 'cursor', VISUAL: 'zed', EDITOR: 'code' }).editor).toBe('cursor')
    expect(getEditorOptions({ VISUAL: 'zed', EDITOR: 'code' }).editor).toBe('zed')
    expect(getEditorOptions({ EDITOR: 'webstorm' }).editor).toBe('webstorm')
    expect(getEditorOptions({ LAUNCH_EDITOR: '/custom/editor', EDITOR: 'code' }).editor).toBeUndefined()
    expect(getEditorOptions({}).editor).toBeUndefined()
  })
})
