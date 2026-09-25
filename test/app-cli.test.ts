import { EventEmitter } from 'node:events'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import process from 'node:process'
import spawn from 'cross-spawn'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createCli } from '../packages/valaxy/node/cli'
import { collectAddonCliExtensions, shouldResolveAddonCli } from '../packages/valaxy/node/cli/addons'
import { openDesktopApp } from '../packages/valaxy/node/cli/app'

vi.mock('cross-spawn', () => ({ default: vi.fn() }))
afterEach(() => vi.resetAllMocks())

function childResult(event: 'exit' | 'error', value: unknown): void {
  vi.mocked(spawn).mockImplementation(() => {
    const child = new EventEmitter()
    queueMicrotask(() => child.emit(event, value))
    return child as ReturnType<typeof spawn>
  })
}

describe('optional desktop CLI forwarding', () => {
  it('forwards default and quoted paths as arguments', async () => {
    childResult('exit', 0)
    await openDesktopApp()
    expect(spawn).toHaveBeenLastCalledWith('yunzhan', ['app', process.cwd()], { stdio: 'inherit' })
    await openDesktopApp('./中文 博客', '/Applications/云栈.app')
    expect(spawn).toHaveBeenLastCalledWith('yunzhan', ['app', resolve('./中文 博客'), '--app', '/Applications/云栈.app'], { stdio: 'inherit' })
  })

  it('reports missing CLI and nonzero child exit without auto-installing', async () => {
    childResult('error', Object.assign(new Error('missing'), { code: 'ENOENT' }))
    await expect(openDesktopApp()).rejects.toThrow('Nothing was downloaded')
    childResult('exit', 2)
    await expect(openDesktopApp()).rejects.toThrow('yunzhan doctor')
  })

  it('reserves app and does not evaluate project config for opening or help', async () => {
    expect(shouldResolveAddonCli(['app', '.'])).toBe(false)
    expect(() => collectAddonCliExtensions([{ name: 'valaxy-addon-app', extendCli() {} }])).toThrow('reserved')
    const root = await mkdtemp(join(tmpdir(), 'valaxy-app-cli-'))
    try {
      await writeFile(join(root, 'valaxy.config.ts'), 'throw new Error("must not execute config")')
      childResult('exit', 0)
      const cli = await createCli(['app', root], { userRoot: root })
      await cli.exitProcess(false).parseAsync()
      expect(spawn).toHaveBeenCalledOnce()
      const help = await createCli(['app', '--help'], { userRoot: root })
      expect(await help.exitProcess(false).getHelp()).toContain('YunZhan')
      expect(spawn).toHaveBeenCalledOnce()
    }
    finally { await rm(root, { recursive: true, force: true }) }
  })
})
