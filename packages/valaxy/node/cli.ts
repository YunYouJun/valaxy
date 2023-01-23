import path from 'path'
import { exec } from 'child_process'
import fs from 'fs-extra'
import yargs from 'yargs'
import type { InlineConfig, LogLevel } from 'vite'
import { mergeConfig } from 'vite'
import openBrowser from 'open'

import consola from 'consola'

import { yellow } from 'kolorist'
import { hideBin } from 'yargs/helpers'
import { version } from '../package.json'
import { findFreePort } from './utils/net'
import { resolveOptions } from './options'
import { bindShortcut, initServer, printInfo } from './utils/cli'

// build
import { build, ssgBuild } from './build'
// rss
import { build as rssBuild } from './rss'
import { getIndexHtml, mergeViteConfigs } from './common'
import { registerFuseCommand } from './cli/fuse'
import { registerNewCommand } from './cli/new'

import { setEnv, setEnvProd } from './utils/env'
import { commonOptions } from './cli/options'

export const cli = yargs(hideBin(process.argv)).scriptName('valaxy')
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

    if (!fs.existsSync(path.resolve(root, 'pages')))
      process.exit(0)

    const port = userPort || await findFreePort(4859)
    const options = await resolveOptions({ userRoot: root })

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
    })
    .option('log', {
      default: 'warn',
      type: 'string',
      choices: ['error', 'warn', 'info', 'silent'],
      describe: 'log level',
    })
    .strict()
    .help(),
  async ({ ssg, root, output, log }) => {
    setEnvProd()

    const options = await resolveOptions({ userRoot: root }, 'build')
    printInfo(options)

    const valaxyViteConfig: InlineConfig = mergeConfig(await mergeViteConfigs(options, 'build'), options.config.vite || {})
    const viteConfig: InlineConfig = mergeConfig(
      valaxyViteConfig,
      {
        // avoid load userRoot/vite.config.ts repeatedly
        configFile: path.resolve(options.clientRoot, 'vite.config.ts'),
        build: {
        // make out dir empty, https://vitejs.dev/config/#build-emptyoutdir
          emptyOutDir: true,
          outDir: path.resolve(options.userRoot, output),
        },
        logLevel: log as LogLevel,
      },
    )

    // merge index.html
    const templatePath = path.resolve(options.clientRoot, 'template.html')
    const indexPath = path.resolve(options.clientRoot, 'index.html')
    if (fs.existsSync(templatePath))
      await fs.copyFile(templatePath, indexPath)
    const indexHtml = await getIndexHtml(options)
    await fs.writeFile(indexPath, indexHtml, 'utf-8')

    try {
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
    }
    finally {
      // await fs.unlink(indexPath)
      await fs.copyFile(templatePath, indexPath)
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
    setEnvProd()
    consola.info('Generate RSS ...')
    const options = await resolveOptions({ userRoot: root }, 'build')
    await rssBuild(options)
  },
)

registerNewCommand(cli)
registerFuseCommand(cli)

export function run() {
  cli.help().parse()
}
