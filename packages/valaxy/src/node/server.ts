import type { InlineConfig } from 'vite'
import { createServer as createViteServer, mergeConfig } from 'vite'

import type { ResolvedValaxyOptions, ValaxyServerOptions } from './options'
import { createViteConfig } from './vite'

export async function createServer(
  options: ResolvedValaxyOptions,
  viteConfig: InlineConfig = {},
  serverOptions: ValaxyServerOptions = {},
) {
  // default editor vscode
  process.env.EDITOR = process.env.EDITOR || 'code'

  const server = await createViteServer(mergeConfig(
    viteConfig,
    createViteConfig(options, serverOptions),
  ))

  return server
}
