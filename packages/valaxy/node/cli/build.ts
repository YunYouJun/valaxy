import path from 'node:path'
import consola from 'consola'
import type { InlineConfig, LogLevel } from 'vite'
import { mergeConfig } from 'vite'
import type yargs from 'yargs'
import fs from 'fs-extra'
import { yellow } from 'kolorist'
import { build, postProcessForSSG, ssgBuild } from '../build'
import { mergeViteConfigs, resolveOptions } from '..'
import { createValaxyNode } from '../app'
import type { ValaxyModule } from '../modules'
import { setupModules } from '../modules'
import { rssModule } from '../modules/rss'
import { printInfo } from '../utils/cli'
import { setEnvProd } from '../utils/env'
import { commonOptions } from './options'

export function registerBuildCommand(cli: yargs.Argv) {
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

      const valaxyApp = createValaxyNode(options)
      // resolve options and create valaxy app
      await valaxyApp.hooks.callHook('options:resolved')

      const modules: ValaxyModule[] = []
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
        },
      )
      // init config
      await valaxyApp.hooks.callHook('config:init')

      // merge index.html
      const templatePath = path.resolve(options.clientRoot, 'template.html')
      const indexPath = path.resolve(options.clientRoot, 'index.html')
      if (fs.existsSync(templatePath))
        await fs.copyFile(templatePath, indexPath)
      // const indexHtml = await getIndexHtml(options)
      // await fs.writeFile(indexPath, indexHtml, 'utf-8')

      // before build
      await valaxyApp.hooks.callHook('build:before')

      try {
        if (ssg) {
          consola.info(`use ${yellow('vite-ssg')} to do ssg build...`)

          try {
            await ssgBuild(options, viteConfig)
            await postProcessForSSG(options)
          }
          catch (e) {
            consola.error('[vite-ssg] An internal error occurred.')
            // eslint-disable-next-line no-console
            console.log(e)
          }
        }
        else {
          consola.info('use vite do spa build...')
          await build(options, viteConfig)
        }
      }
      catch (e) {
      // eslint-disable-next-line no-console
        console.log(e)
      }
      finally {
      // await fs.unlink(indexPath)
        // await fs.copyFile(templatePath, indexPath)

        // after build
        await valaxyApp.hooks.callHook('build:after')
      }
    },
  )
}
