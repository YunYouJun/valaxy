import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import type { Argv } from 'yargs'
import yargs from 'yargs'
import type { InlineConfig, LogLevel } from 'vite'
import openBrowser from 'open'

import consola from 'consola'

import { yellow } from 'kolorist'
import { version } from '../../package.json'
import { findFreePort } from './utils/net'
import { resolveOptions } from './options'
import { bindShortcut, initServer, printInfo } from './utils/cli'

// build
import { build, ssgBuild } from './build'
// rss
import { build as rssBuild } from './rss'

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
  async ({ root, port: userPort, open, remote, log }) => {
    if (!fs.existsSync(path.resolve(root, 'pages')))
      process.exit(0)

    const port = await findFreePort(userPort || 4859)
    const options = await resolveOptions({ userRoot: root })

    const viteConfig: InlineConfig = {
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

cli.command(
  'build [root]',
  'build your blog to static content',
  args => commonOptions(args)
    .option('ssg', {
      alias: 's',
      type: 'boolean',
      // https://github.com/antfu/vite-ssg/pull/219
      // to be true, when vite-ssg export build
      default: false,
      describe: 'static site generate',
    })
    .option('output', {
      alias: 'o',
      type: 'string',
      default: 'dist',
      describe: 'output dir',
    }).option('base', {
      type: 'string',
      default: '/',
      describe: 'output base',
    })
    .strict()
    .help(),
  async ({ ssg, root, base, output }) => {
    const options = await resolveOptions({ userRoot: root }, 'build')
    printInfo(options)

    const viteConfig = {
      base,
      build: {
        // make out dir empty, https://vitejs.dev/config/#build-emptyoutdir
        emptyOutDir: true,
        outDir: path.resolve(options.userRoot, output),
      },
    }

    if (ssg) {
      consola.info(`use ${yellow('vite-ssg')} to do ssg build...`)

      try {
        await ssgBuild(options, viteConfig)
      }
      catch (e) {
        consola.error('[vite-ssg] An internal error occurred.')
        console.log(e)
      }
    }
    else {
      consola.info('use vite do spa build...')
      await build(options, viteConfig)
    }
  },
)

cli.command(
  'rss [root]',
  'generate rss feed',
  args => commonOptions(args)
    .strict()
    .help(),
  async ({ root }) => {
    consola.info('Generate RSS ...')
    const options = await resolveOptions({ userRoot: root }, 'build')
    await rssBuild(options)
  },
)

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
