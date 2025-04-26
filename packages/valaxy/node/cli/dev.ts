import type { InlineConfig, LogLevel, ViteDevServer } from 'vite'
import type { Argv } from 'yargs'
import path from 'node:path'
import process from 'node:process'

import { mergeConfig } from 'vite'
import { createValaxyNode } from '../app'
import { commonOptions } from '../cli/options'

import { defaultViteConfig } from '../constants'
import { GLOBAL_STATE } from '../env'
import { resolveOptions } from '../options'
import { isPagesDirExist, setEnv, setTimezone } from '../utils/env'
import { findFreePort } from '../utils/net'
import { initServer, printInfo } from './utils/cli'
import { bindShortcuts } from './utils/shortcuts'

export async function startValaxyDev({
  root = process.cwd(),
  port,
  remote,
  log,
  open,
}: {
  root?: string
  port?: number
  remote?: boolean
  log?: LogLevel
  open?: boolean
}) {
  setEnv()

  if (!isPagesDirExist(root))
    process.exit(0)

  port = port || await findFreePort(4859)
  const resolvedOptions = await resolveOptions({ userRoot: root })
  setTimezone(resolvedOptions.config.siteConfig.timezone)

  const valaxyApp = createValaxyNode(resolvedOptions)
  GLOBAL_STATE.valaxyApp = valaxyApp

  const viteConfig: InlineConfig = mergeConfig({
    // initial vite config
    ...defaultViteConfig,
    // avoid load userRoot/vite.config.ts repeatedly
    configFile: path.resolve(resolvedOptions.clientRoot, 'vite.config.ts'),
    server: {
      watch: {
        // watch theme updated
        ignored: [`!${resolvedOptions.themeRoot}/**`, `${resolvedOptions.userRoot}/**.md`],
      },

      port,
      strictPort: true,
      open,
      host: remote ? '0.0.0.0' : 'localhost',
    },
    logLevel: log as LogLevel,
  }, resolvedOptions.config.vite || {})

  const server = await initServer(valaxyApp, viteConfig)
  printInfo(resolvedOptions, port, remote)

  return server
}

export function registerDevCommand(cli: Argv) {
  cli.command(
    '* [root]',
    'Start a local server for Valaxy',
    args =>
      commonOptions(args)
        .option('port', {
          alias: 'p',
          type: 'number',
          describe: 'port',
        })
        .option('open', {
          alias: 'o',
          default: false,
          type: 'boolean',
          describe: 'open in browser',
        })
        .option('remote', {
          default: true,
          type: 'boolean',
          describe: 'listen public host and enable remote control',
        })
        .option('log', {
          default: 'info',
          type: 'string',
          choices: ['error', 'warn', 'info', 'silent'],
          describe: 'log level',
        })
        .strict()
        .help(),
    async ({ root, port, open, remote, log }) => {
      let server: ViteDevServer | undefined
      const createDevServer = async () => {
        server = await startValaxyDev({
          root,
          open,
          port,
          remote,
          log: log as LogLevel,
        })
        bindShortcuts(server, createDevServer)
      }
      createDevServer()
    },
  )
}
