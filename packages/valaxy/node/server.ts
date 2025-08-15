import type { InlineConfig } from 'vite'
import type { ValaxyNode, ValaxyServerOptions } from './types'

import process from 'node:process'
import { colors } from 'consola/utils'
import { createServer as createViteServer, mergeConfig as mergeViteConfig } from 'vite'
// import { serverSpinner } from './cli/utils/cli'
import { valaxyPrefix } from './logger'
import { ViteValaxyPlugins } from './plugins/preset'

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
  const plugins = await ViteValaxyPlugins(valaxyApp, serverOptions)

  // dynamic import to avoid bundle it in build
  const enableDevtools = options.config.devtools
  const vitePlugins = [
    ...plugins,
  ]
  if (enableDevtools) {
    // only enable when dev
    vitePlugins.push(
      (await import('vite-plugin-vue-devtools')).default(),
      (await import('@valaxyjs/devtools')).default({
        userRoot: options.userRoot,
      }),
    )
  }

  // serverSpinner.text = getServerInfoText('merge vite config ...')
  const mergedViteConfig = mergeViteConfig(
    viteConfig,
    {
      plugins: vitePlugins,
    },
  )
  // serverSpinner.text = getServerInfoText('create vite server ...')
  const server = await createViteServer(mergedViteConfig)
  return server
}
