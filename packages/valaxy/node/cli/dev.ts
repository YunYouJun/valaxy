import path from 'node:path'
import { exec } from 'node:child_process'
import process from 'node:process'
import os from 'node:os'
import type yargs from 'yargs'
import type { InlineConfig, LogLevel } from 'vite'
import { mergeConfig } from 'vite'

import qrcode from 'qrcode'
import { findFreePort } from '../utils/net'
import { resolveOptions } from '../options'

import { isPagesDirExist, setEnv } from '../utils/env'
import { commonOptions } from '../cli/options'
import { createValaxyNode } from '../app'
import { bindShortcut, initServer, printInfo } from './utils/cli'

export function registerDevCommand(cli: yargs.Argv) {
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
    async ({ root, port: userPort, open, remote, log }) => {
      setEnv()

      if (!isPagesDirExist(root))
        process.exit(0)

      const port = userPort || await findFreePort(4859)
      const options = await resolveOptions({ userRoot: root })

      createValaxyNode(options)

      const viteConfig: InlineConfig = mergeConfig({
      // avoid load userRoot/vite.config.ts repeatedly
        configFile: path.resolve(options.clientRoot, 'vite.config.ts'),
        server: {
          watch: {
          // watch theme updated
            ignored: [`!${options.themeRoot}/**`, `${options.userRoot}/**.md`],
          },

          port,
          strictPort: true,
          open,
          host: remote ? '0.0.0.0' : 'localhost',
        },
        logLevel: log as LogLevel,
      }, options.config.vite || {})

      await initServer(options, viteConfig)
      printInfo(options, port, remote)

      const SHORTCUTS = [
        {
          name: 'r',
          fullName: 'restart',
          action() {
            initServer(options, viteConfig)
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
              // eslint-disable-next-line no-console
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
    },
  )
}
