import type { InlineConfig, LogLevel } from 'vite'
import type { Argv } from 'yargs'
import type { ValaxyModule } from '../modules'
import path from 'node:path'
import process from 'node:process'
import consola from 'consola'

import { yellow } from 'picocolors'
import { mergeConfig } from 'vite'
import { mergeViteConfigs, resolveOptions } from '..'
import { createValaxyNode } from '../app'
import { build, postProcessForSSG, ssgBuild } from '../build'
import { callHookWithLog } from '../logger'
import { setupModules } from '../modules'
import { fuseModule } from '../modules/fuse'
import { rssModule } from '../modules/rss'
import { isPagesDirExist, setEnvProd, setTimezone } from '../utils/env'
import { commonOptions } from './options'
import { printInfo } from './utils/cli'

/**
 * valaxy build
 */
export async function execBuild({ ssg, root, output, log }: { ssg: boolean, root: string, output: string, log: string }) {
  setEnvProd()

  if (!isPagesDirExist(root))
    process.exit(0)

  const userRoot = path.resolve(root)
  const options = await resolveOptions({ userRoot }, 'build')
  setTimezone(options.config.siteConfig.timezone)
  printInfo(options)

  const valaxyApp = createValaxyNode(options)
  // GLOBAL_STATE.valaxyApp = valaxyApp

  // resolve options and create valaxy app
  await callHookWithLog('options:resolved', valaxyApp)

  const modules: ValaxyModule[] = []
  if (options.config.siteConfig.search.type === 'fuse')
    modules.push(fuseModule)
  if (options.config.modules.rss.enable)
    modules.push(rssModule)

  // setup modules
  setupModules(
    valaxyApp,
    modules,
  )

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

    } as InlineConfig,
  )
  // init config
  await callHookWithLog('config:init', valaxyApp)

  // before build
  await callHookWithLog('build:before', valaxyApp)

  consola.box('🌠 Start building...')
  try {
    if (ssg) {
      consola.info(`use ${yellow('vite-ssg')} to do ssg build...`)

      try {
        await ssgBuild(valaxyApp, viteConfig)
        await postProcessForSSG(options)
      }
      catch (e) {
        consola.error('[vite-ssg] An internal error occurred.')

        console.log(e)
      }
    }
    else {
      consola.info('use vite do spa build...')
      await build(valaxyApp, viteConfig)
    }
  }
  catch (e) {
    console.log(e)
  }
  finally {
  // await fs.unlink(indexPath)
    // await fs.copyFile(templatePath, indexPath)

    // after build
    await callHookWithLog('build:after', valaxyApp)
  }
}

export function registerBuildCommand(cli: Argv) {
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
      await execBuild({ ssg, root, output, log })
    },
  )
}
