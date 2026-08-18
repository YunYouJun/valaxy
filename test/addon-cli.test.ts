import type { Argv } from 'yargs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createCli } from '../packages/valaxy/node/cli'
import {
  collectAddonCliExtensions,
  getAddonCommandName,
  shouldResolveAddonCli,
} from '../packages/valaxy/node/cli/addons'

const tempRoots: string[] = []
function extendCli(_cli: Argv<object>) {}

async function createTempRoot() {
  const root = await mkdtemp(join(tmpdir(), 'valaxy-addon-cli-'))
  tempRoots.push(root)
  return root
}

async function writeFixtureConfig(root: string) {
  await writeFile(join(root, 'valaxy.config.ts'), `
    import { writeFile } from 'node:fs/promises'
    import { join } from 'node:path'

    export default {
      addons: [{
        name: 'valaxy-addon-fixture',
        enable: true,
        extendCli(cli, { userRoot }) {
          cli.version('9.8.7')
          cli.command('ping', 'Write a marker', () => {}, async () => {
            await writeFile(join(userRoot, 'addon-cli-marker.txt'), 'pong')
          })
        },
      }],
    }
  `)
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map(root => rm(root, { force: true, recursive: true })))
})

describe('addon CLI namespace', () => {
  it('derives the root command from unscoped and scoped addon package names', () => {
    expect(getAddonCommandName('valaxy-addon-moments')).toBe('moments')
    expect(getAddonCommandName('@example/valaxy-addon-moments')).toBe('moments')
    expect(() => getAddonCommandName('example-moments')).toThrow('does not start with')
  })

  it('ignores disabled and string addons', () => {
    expect(collectAddonCliExtensions([
      'moments',
      { enable: false, extendCli, name: 'valaxy-addon-disabled' },
      { name: 'valaxy-addon-without-cli' },
    ])).toEqual([])
  })

  it('rejects core command overrides and duplicate addon commands', () => {
    expect(() => collectAddonCliExtensions([
      { extendCli, name: 'valaxy-addon-build' },
    ])).toThrow('reserved Valaxy command "build"')

    expect(() => collectAddonCliExtensions([
      { extendCli, name: 'valaxy-addon-moments' },
      { extendCli, name: '@example/valaxy-addon-moments' },
    ])).toThrow('both register the Valaxy command "moments"')
  })

  it('only resolves addons for a non-core, non-path command', () => {
    expect(shouldResolveAddonCli(['moments', 'new'])).toBe(true)
    expect(shouldResolveAddonCli(['moments', '-v'])).toBe(true)
    expect(shouldResolveAddonCli(['build'])).toBe(false)
    expect(shouldResolveAddonCli(['--help'])).toBe(false)
    expect(shouldResolveAddonCli(['-v'])).toBe(false)
    expect(shouldResolveAddonCli(['--port', '3000'])).toBe(false)
    expect(shouldResolveAddonCli(['./moments'])).toBe(false)
  })
})

describe('addon CLI dispatch', () => {
  it('does not load project config for global help', async () => {
    const root = await createTempRoot()
    await writeFile(join(root, 'valaxy.config.ts'), 'throw new Error("global help loaded project config")\n')

    const cli = await createCli(['--help'], { userRoot: root })
    await expect(cli.getHelp()).resolves.not.toContain('fixture')
  })

  it('loads an enabled addon and dispatches inside its namespace', async () => {
    const root = await createTempRoot()
    await writeFixtureConfig(root)

    const cli = await createCli(['fixture', 'ping'], { userRoot: root })
    await cli.exitProcess(false).parseAsync()

    await expect(readFile(join(root, 'addon-cli-marker.txt'), 'utf-8')).resolves.toBe('pong')
  })

  it('lets an addon report its version inside its namespace', async () => {
    const root = await createTempRoot()
    await writeFixtureConfig(root)
    const output: string[] = []
    const log = vi.spyOn(console, 'log').mockImplementation(message => output.push(String(message)))

    try {
      const cli = await createCli(['fixture', '-v'], { userRoot: root })
      await cli.exitProcess(false).parseAsync()
    }
    finally {
      log.mockRestore()
    }

    expect(output).toEqual(['9.8.7'])
  })

  it('shows namespace help when no addon subcommand is provided', async () => {
    const root = await createTempRoot()
    await writeFixtureConfig(root)
    const output: string[] = []
    const log = vi.spyOn(console, 'log').mockImplementation(message => output.push(String(message)))

    const cli = await createCli(['fixture'], { userRoot: root })
    await cli.exitProcess(false).parseAsync()

    log.mockRestore()
    expect(output.join('\n')).toContain('valaxy fixture <command>')
    expect(output.join('\n')).toContain('ping')
  })
})
