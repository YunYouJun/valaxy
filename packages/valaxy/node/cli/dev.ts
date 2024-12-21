import type { InlineConfig, LogLevel } from 'vite'
import type { Argv } from 'yargs'
import { exec } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import qrcode from 'qrcode'

import { mergeConfig } from 'vite'
import { createValaxyNode } from '../app'
import { commonOptions } from '../cli/options'
import { defaultViteConfig } from '../constants'

import { GLOBAL_STATE } from '../env'
import { resolveOptions } from '../options'
import { isPagesDirExist, setEnv, setTimezone } from '../utils/env'
import { findFreePort } from '../utils/net'
import { bindShortcut, initServer, printInfo } from './utils/cli'

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

  await initServer(valaxyApp, viteConfig)
  printInfo(resolvedOptions, port, remote)

  const SHORTCUTS = [
    {
      name: 'r',
      fullName: 'restart',
      async action() {
        await initServer(valaxyApp, viteConfig)
        printInfo(resolvedOptions, port, remote)
      },
    },
    {
      name: 'o',
      fullName: 'open',
      async action() {
        const { default: openBrowser } = await import('open')
        openBrowser(`http://localhost:${port}`)
      },
    },
    {
      name: 'q',
      fullName: 'qr',
      action() {
        const addresses = Object.values(os.networkInterfaces())
          .flat()
          .filter(details => details?.family === 'IPv4' && !details.address.includes('127.0.0.1'))
        const remoteUrl = `http://${addresses[0]?.address || 'localhost'}:${port}`
        qrcode.toString(remoteUrl, { type: 'terminal' }, (err, qrCode) => {
          if (err)
            throw err

          console.log(qrCode)
        })
      },
    },
    {
      name: 'e',
      fullName: 'edit',
      action() {
        exec(`code "${root}"`)
      },
    },
  ]
  bindShortcut(SHORTCUTS)
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
        .help()
    ,
    async ({ root, port, open, remote, log }) => {
      startValaxyDev({
        root,
        open,
        port,
        remote,
        log: log as LogLevel,
      })
    },
  )
}
