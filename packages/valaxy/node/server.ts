import process from 'node:process'
import type { InlineConfig } from 'vite'
import { createServer as createViteServer, mergeConfig as mergeViteConfig } from 'vite'

import VueDevTools from 'vite-plugin-vue-devtools'
import type { ResolvedValaxyOptions, ValaxyServerOptions } from './options'
import { ViteValaxyPlugins } from './plugins/preset'

export async function createServer(
  options: ResolvedValaxyOptions,
  viteConfig: InlineConfig = {},
  serverOptions: ValaxyServerOptions = {},
) {
  // default editor vscode
  process.env.EDITOR = process.env.EDITOR || 'code'

  const plugins = await ViteValaxyPlugins(options, serverOptions)
  const mergedViteConfig = mergeViteConfig(
    viteConfig,
    {
      plugins: [
        ...plugins,

        // only enable when dev
        options.mode === 'dev' && options.config.devtools && VueDevTools(),
      ],
    },
  )
  const server = await createViteServer(mergedViteConfig)
  return server
}
