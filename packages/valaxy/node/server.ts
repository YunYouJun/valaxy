import process from 'node:process'
import type { InlineConfig } from 'vite'
import { createServer as createViteServer, mergeConfig as mergeViteConfig } from 'vite'

import type { ValaxyNode } from './types'
import type { ValaxyServerOptions } from './options'
import { ViteValaxyPlugins } from './plugins/preset'

export async function createServer(
  valaxyApp: ValaxyNode,
  viteConfig: InlineConfig = {},
  serverOptions: ValaxyServerOptions = {},
) {
  // default editor vscode
  process.env.EDITOR = process.env.EDITOR || 'code'

  const { options } = valaxyApp

  const plugins = await ViteValaxyPlugins(valaxyApp, serverOptions)
  // dynamic import to avoid bundle it in build
  const enableDevtools = options.mode === 'dev' && options.config.devtools
  const vitePlugins = [
    ...plugins,
  ]
  if (enableDevtools) {
    // only enable when dev
    vitePlugins.push(
      (await import('vite-plugin-vue-devtools')).default(),
      (await import('@valaxyjs/devtools')).default(),
    )
  }

  const mergedViteConfig = mergeViteConfig(
    viteConfig,
    {
      plugins: vitePlugins,
    },
  )
  const server = await createViteServer(mergedViteConfig)
  return server
}
