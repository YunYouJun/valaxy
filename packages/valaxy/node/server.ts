import type { InlineConfig } from 'vite'
import { createServer as createViteServer, resolveConfig } from 'vite'
import { mergeViteConfigs } from './common'

import type { ResolvedValaxyOptions, ValaxyServerOptions } from './options'
import { createViteConfig } from './vite'

export async function createServer(
  options: ResolvedValaxyOptions,
  viteConfig: InlineConfig = {},
  serverOptions: ValaxyServerOptions = {},
) {
  const rawConfig = await resolveConfig({}, 'serve')
  const pluginOptions = rawConfig.valaxy || {}

  // default editor vscode
  process.env.EDITOR = process.env.EDITOR || 'code'

  const server = await createViteServer(
    await mergeViteConfigs(
      options,
      viteConfig,
      await createViteConfig(options, pluginOptions, serverOptions),
      'serve',
    ),
  )

  return server
}
