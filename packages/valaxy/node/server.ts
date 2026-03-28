import type { InlineConfig } from 'vite'
import type { ValaxyNode, ValaxyServerOptions } from './types'

import process from 'node:process'
import { colors } from 'consola/utils'
import { createServer as createViteServer, mergeConfig as mergeViteConfig } from 'vite'
// import { serverSpinner } from './cli/utils/cli'
import { valaxyPrefix, vLogger } from './logger'
import { ViteValaxyPlugins } from './plugins/preset'
import { countPerformanceTime } from './utils/performance'

/**
 * with valaxyPrefix
 */
export function getServerInfoText(msg: string) {
  return `${valaxyPrefix} ${colors.gray(msg)}`
}

export async function createServer(
  valaxyApp: ValaxyNode,
  viteConfig: InlineConfig = {},
  serverOptions: ValaxyServerOptions = {},
) {
  // default editor vscode
  process.env.EDITOR = process.env.EDITOR || 'code'

  const { options } = valaxyApp

  // serverSpinner.text = getServerInfoText('init vite plugins ..')
  const pluginsTimer = countPerformanceTime()
  const plugins = await ViteValaxyPlugins(valaxyApp, serverOptions)
  vLogger.debug(`ViteValaxyPlugins: ${pluginsTimer()}`)

  // dynamic import to avoid bundle it in build
  const enableDevtools = options.config.devtools
  const vitePlugins = [
    ...plugins,
  ]
  if (enableDevtools) {
    // only enable when dev — import both in parallel
    const devtoolsTimer = countPerformanceTime()
    const [vueDevtools, valaxyDevtools] = await Promise.all([
      import('vite-plugin-vue-devtools'),
      import('@valaxyjs/devtools'),
    ])
    vitePlugins.push(
      vueDevtools.default(),
      valaxyDevtools.default({
        userRoot: options.userRoot,
      }),
    )
    vLogger.debug(`devtools plugins: ${devtoolsTimer()}`)
  }

  // serverSpinner.text = getServerInfoText('merge vite config ...')
  const mergedViteConfig = mergeViteConfig(
    viteConfig,
    {
      plugins: vitePlugins,
    },
  )
  // serverSpinner.text = getServerInfoText('create vite server ...')
  const viteServerTimer = countPerformanceTime()
  const server = await createViteServer(mergedViteConfig)
  vLogger.debug(`createViteServer: ${viteServerTimer()}`)
  return server
}
