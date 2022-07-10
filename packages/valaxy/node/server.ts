import type { InlineConfig } from 'vite'
import { createServer as createViteServer, mergeConfig } from 'vite'

import type { ResolvedValaxyOptions, ValaxyServerOptions } from './options'
import { ViteValaxyPlugins } from './plugins/preset'

export async function createServer(
  options: ResolvedValaxyOptions,
  viteConfig: InlineConfig = {},
  serverOptions: ValaxyServerOptions = {},
) {
  // default editor vscode
  process.env.EDITOR = process.env.EDITOR || 'code'

  const server = await createViteServer(
    mergeConfig(
      viteConfig,
      {
        plugins: await ViteValaxyPlugins(options, viteConfig.valaxy || {}, serverOptions),
      },
    ),
  )

  return server
}
