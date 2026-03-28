import type { InlineConfig, LogLevel, ViteDevServer } from 'vite'
import type { Argv } from 'yargs'
import type { ContentLoaderContext } from '../types/loader'
import path from 'node:path'
import process from 'node:process'
import { consola } from 'consola'

import { mergeConfig } from 'vite'
import { createValaxyNode } from '../app'
import { commonOptions } from '../cli/options'

import { defaultViteConfig } from '../constants'
import { GLOBAL_STATE } from '../env'
import { setLogLevel, vLogger } from '../logger'
import { validateTaxonomyI18n } from '../modules/taxonomy-i18n'
import { resolveOptions } from '../options'
import { isPagesDirExist, setEnv, setTimezone } from '../utils/env'
import { findFreePort } from '../utils/net'
import { countPerformanceTime } from '../utils/performance'
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
  const totalTimer = countPerformanceTime()
  setEnv()

  // Set consola log level for debug output
  if (log === 'debug' as any)
    setLogLevel(4)

  if (!(await isPagesDirExist(root)))
    process.exit(0)

  port = port || await findFreePort(4859)

  const resolveTimer = countPerformanceTime()
  const resolvedOptions = await resolveOptions({ userRoot: root })
  vLogger.debug(`resolveOptions: ${resolveTimer()}`)

  setTimezone(resolvedOptions.config.siteConfig.timezone)

  const createNodeTimer = countPerformanceTime()
  const valaxyApp = createValaxyNode(resolvedOptions)
  vLogger.debug(`createValaxyNode: ${createNodeTimer()}`)
  GLOBAL_STATE.valaxyApp = valaxyApp

  // Load content from external loaders before starting the dev server
  const loaders = resolvedOptions.config.loaders
  if (loaders?.length) {
    const contentTimer = countPerformanceTime()
    const { loadAllContent } = await import('../modules/content')
    const { resolve } = await import('pathe')
    const cacheDir = resolve(resolvedOptions.tempDir, 'content')
    const ctx: ContentLoaderContext = {
      node: valaxyApp,
      cacheDir,
      mode: 'dev',
    }

    await valaxyApp.hooks.callHook('content:before-load')
    await loadAllContent(loaders, ctx)
    await valaxyApp.hooks.callHook('content:loaded')
    await validateTaxonomyI18n(resolvedOptions)
    vLogger.debug(`content loaders: ${contentTimer()}`)

    // Set up polling for loaders that request it
    for (const loader of loaders) {
      if (loader.devPollInterval) {
        const poll = async () => {
          try {
            await valaxyApp.hooks.callHook('content:before-load')
            await loadAllContent([loader], ctx)
            await valaxyApp.hooks.callHook('content:loaded')
            await validateTaxonomyI18n(resolvedOptions)
          }
          catch (error) {
            consola.error('[content-loader] Error while polling:', error)
          }
          finally {
            if (loader.devPollInterval)
              setTimeout(poll, loader.devPollInterval)
          }
        }
        setTimeout(poll, loader.devPollInterval)
      }
    }
  }
  else {
    const taxonomyTimer = countPerformanceTime()
    await validateTaxonomyI18n(resolvedOptions)
    vLogger.debug(`validateTaxonomyI18n: ${taxonomyTimer()}`)
  }

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
  vLogger.info(`total startup: ${totalTimer()}`)
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
          choices: ['error', 'warn', 'info', 'debug', 'silent'],
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
      await createDevServer()
      // Keep the process alive — yargs 18 exits after async handlers resolve
      await new Promise(() => {})
    },
  )
}
