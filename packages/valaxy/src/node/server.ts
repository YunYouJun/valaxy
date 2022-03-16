import type { InlineConfig, ServerOptions } from 'vite'
import { createServer as createViteServer, mergeConfig } from 'vite'

import type { ResolvedValaxyOptions } from './options'
import { createViteConfig } from './vite'

export async function createServer(
  options: ResolvedValaxyOptions,
  viteConfig: InlineConfig = {},
  serverOptions: ServerOptions = {},
) {
  // default editor vscode
  process.env.EDITOR = process.env.EDITOR || 'code'

  const server = await createViteServer(mergeConfig(
    viteConfig,
    createViteConfig(options, serverOptions),
  ))

  return server
}
