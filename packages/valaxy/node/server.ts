import type { InlineConfig } from 'vite'
import { createServer as createViteServer, mergeConfig as mergeViteConfig } from 'vite'

import type { ResolvedValaxyOptions, ValaxyServerOptions } from './options'
import { ViteValaxyPlugins } from './plugins/preset'
import { resolveSiteConfig } from './utils/config'

export async function createServer(
  options: ResolvedValaxyOptions,
  viteConfig: InlineConfig = {},
  serverOptions: ValaxyServerOptions = {},
) {
  // default editor vscode
  process.env.EDITOR = process.env.EDITOR || 'code'

  const config = await resolveSiteConfig(options, viteConfig)

  const server = await createViteServer(
    mergeViteConfig(
      config.vite!,
      {
        plugins: await ViteValaxyPlugins(options, config, serverOptions),
      },
    ),
  )

  return server
}
