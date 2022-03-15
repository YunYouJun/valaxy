import path from 'path'
import type { InlineConfig, ServerOptions } from 'vite'
import { createServer as createViteServer, mergeConfig } from 'vite'

import generateSitemap from 'vite-ssg-sitemap'

import type { ResolvedValaxyOptions } from './options'
import { ViteValaxyPlugin } from './plugins/preset'
// import { resolveConfig } from './config'

export async function createServer(
  options: ResolvedValaxyOptions,
  viteConfig: InlineConfig = {},
  serverOptions: ServerOptions = {},
) {
  return createViteServer(mergeConfig(
    viteConfig,
    <InlineConfig>({
      resolve: {
        alias: {
          '~/': `${path.resolve(__dirname, 'src')}/`,
        },
      },

      root: options.clientRoot,
      // todo
      // base: config.site.base,
      server: serverOptions,
      plugins: [
        await ViteValaxyPlugin(options),
      ],

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
}
