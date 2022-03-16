import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import type { Argv } from 'yargs'
import yargs from 'yargs'
import type { LogLevel } from 'vite'
import openBrowser from 'open'
import { version } from '../../package.json'
import { resolveOptions } from './options'
import { bindShortcut, initServer, printInfo } from './utils/cli'

const cli = yargs.scriptName('valaxy')
  .usage('$0 [args]')
  .version(version)
  .showHelpOnFail(false)
  .alias('h', 'help')
  .alias('v', 'version')

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
        default: 'warn',
        type: 'string',
        choices: ['error', 'warn', 'info', 'silent'],
        describe: 'log level',
      })
      .strict()
      .help()
  ,
  async({ root, port: userPort, open, remote, log }) => {
    if (!fs.existsSync(path.resolve(root, 'pages')))
      process.exit(0)

    const port = userPort || 4859
    const options = await resolveOptions({ userRoot: root })

    const viteConfig = {
      server: {
        port,
        strictPort: true,
        open,
        host: remote ? '0.0.0.0' : 'localhost',
      },
      logLevel: log as LogLevel,
    }
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
        action() {
          openBrowser(`http://localhost:${port}`)
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
  })

/**
 * set common options for cli
 * @param args
 * @returns
 */
function commonOptions(args: Argv<{}>) {
  return args.positional('root', {
    default: '.',
    type: 'string',
    describe: 'root folder of your source files',
  })
}

export function run() {
  cli.help().parse()
}
