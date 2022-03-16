import path from 'path'

import generateSitemap from 'vite-ssg-sitemap'
import type { InlineConfig, ServerOptions } from 'vite'
import type { ResolvedValaxyOptions } from './options'

import { ViteValaxyPlugins } from './plugins/preset'
import { VALAXY_CONFIG_ID } from './plugins/valaxy'

export function createViteConfig(options: ResolvedValaxyOptions, serverOptions: ServerOptions = {}): InlineConfig {
  return {
    resolve: {
      alias: {
        'valaxy': `${path.resolve(options.clientRoot, '..')}`,
        '~/': `${path.resolve(options.clientRoot, 'src')}/`,
        [VALAXY_CONFIG_ID]: `/${VALAXY_CONFIG_ID}`,
        '@valaxyjs/core': `${path.resolve(options.clientRoot, '../core')}`,
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
  }
}
