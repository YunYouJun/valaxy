import path from 'path'
import type { InlineConfig, ServerOptions } from 'vite'
import { createServer as createViteServer, mergeConfig } from 'vite'

import generateSitemap from 'vite-ssg-sitemap'

import type { ResolvedValaxyOptions } from './options'
import { ViteValaxyPlugins } from './plugins/preset'
import { VALAXY_CONFIG_ID } from './plugins/valaxy'

export async function createServer(
  options: ResolvedValaxyOptions,
  viteConfig: InlineConfig = {},
  serverOptions: ServerOptions = {},
) {
  // default editor vscode
  process.env.EDITOR = process.env.EDITOR || 'code'

  const server = await createViteServer(mergeConfig(
    viteConfig,
    <InlineConfig>({
      resolve: {
        alias: {
          '~/': `${path.resolve(options.clientRoot, 'src')}/`,
          [VALAXY_CONFIG_ID]: `/${VALAXY_CONFIG_ID}`,
        },
      },

      root: options.clientRoot,
      // todo user base
      // base: '/',

      server: serverOptions,
      plugins: ViteValaxyPlugins(options),

      // https://github.com/antfu/vite-ssg
      ssgOptions: {
        script: 'async',
        formatting: 'minify',
        onFinished() { generateSitemap() },
      },

      optimizeDeps: {
        entries: [path.resolve(options.clientRoot, 'src/main.ts')],

        include: [
          'vue',
          'vue-router',
          '@vueuse/core',
          '@vueuse/head',
        ],
        exclude: [
          'vue-demi',
        ],
      },
    }),
  ))

  return server
}
