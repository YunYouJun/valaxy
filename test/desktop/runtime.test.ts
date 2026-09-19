import { EventEmitter } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PassThrough } from 'node:stream'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DesktopRuntime } from '../../packages/desktop/src/main/runtime'

class Process extends EventEmitter {
  stdout = new PassThrough()
  stderr = new PassThrough()
  postMessage = vi.fn(() => queueMicrotask(() => this.emit('exit', 0)))
  kill = vi.fn(() => true)
}

let root: string
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'valaxy-runtime-'))
})
afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

function setup() {
  const processes: Process[] = []
  const runtime = new DesktopRuntime(() => {
    const child = new Process()
    processes.push(child)
    return child
  }, () => {})
  runtime.selectProject({ root, name: 'blog', version: '1.0.0', dependenciesReady: true })
  return { runtime, processes }
}

describe('desktop lifecycle', () => {
  it('prevents duplicate preview processes and clears addresses after a crash', () => {
    const { runtime, processes } = setup()
    runtime.startPreview()
    expect(() => runtime.startPreview()).toThrow()
    processes[0].emit('message', { type: 'ready', previewUrl: 'http://127.0.0.1:4859/' })
    expect(runtime.state.preview).toBe('running')
    processes[0].emit('exit', 1)
    expect(runtime.state.preview).toBe('error')
    expect(runtime.state.previewUrl).toBeUndefined()
    runtime.startPreview()
    processes[1].emit('exit', 1)
    expect(processes).toHaveLength(2)
  })

  it('requires both a success message and zero exit code before exposing output', async () => {
    const { runtime, processes } = setup()
    await runtime.buildSite()
    processes[0].emit('exit', 0)
    expect(runtime.state.build).toBe('error')
    expect(runtime.state.outputDir).toBeUndefined()
    await runtime.buildSite()
    processes[1].emit('message', { type: 'built', outputDir: '/untrusted/path' })
    processes[1].emit('exit', 0)
    expect(runtime.state.build).toBe('success')
    expect(runtime.state.outputDir).toBe(join(root, 'dist'))
    await runtime.buildSite()
    expect(runtime.state.outputDir).toBeUndefined()
    processes[2].emit('message', { type: 'error', message: 'SSG failed' })
    processes[2].emit('exit', 1)
    await expect(runtime.waitForBuild()).rejects.toThrow('SSG failed')
  })

  it('cancels builds without allowing partial output to be published', async () => {
    const { runtime, processes } = setup()
    await runtime.buildSite()
    await runtime.cancelBuild()
    expect(processes[0].postMessage).toHaveBeenCalledWith('stop')
    expect(runtime.state.build).toBe('cancelled')
    expect(runtime.state.outputDir).toBeUndefined()
  })

  it('waits for preview shutdown before completing app cleanup', async () => {
    const { runtime, processes } = setup()
    runtime.startPreview()
    processes[0].emit('message', { type: 'ready', previewUrl: 'http://127.0.0.1:4859/' })
    await runtime.close()
    expect(runtime.state.preview).toBe('stopped')
    expect(() => runtime.startPreview()).toThrow()
  })

  it('honors cancellation before the build process has started', async () => {
    const { runtime, processes } = setup()
    const starting = runtime.buildSite()
    await runtime.cancelBuild()
    await starting
    expect(processes).toHaveLength(0)
    expect(runtime.state.build).toBe('cancelled')
  })
})
