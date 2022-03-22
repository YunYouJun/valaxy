import path from 'path'

import generateSitemap from 'vite-ssg-sitemap'
import type { InlineConfig } from 'vite'
import { searchForWorkspaceRoot } from 'vite'
import type { ResolvedValaxyOptions, ValaxyServerOptions } from './options'

import { ViteValaxyPlugins } from './plugins/preset'
import { VALAXY_CONFIG_ID } from './plugins/valaxy'

export type Mode = 'dev' | 'build'

export function createViteConfig(options: ResolvedValaxyOptions, serverOptions: ValaxyServerOptions = {}, mode: Mode = 'dev'): InlineConfig {
  const { configFile } = options

  const viteConfig: InlineConfig = {
    // remove vue-i18n warnings
    // https://vue-i18n.intlify.dev/guide/advanced/optimization.html#reduce-bundle-size-with-feature-build-flags
    // https://github.com/antfu/vitesse/issues/131
    // https://github.com/intlify/vue-i18n-next/blob/dab6db19a1ef917425939275a41dfde9b6c61fe9/packages/vue-i18n-core/src/misc.ts#L20
    // I create a issue https://github.com/intlify/vue-i18n-next/issues/961
    // define: {
    //   __FEATURE_FULL_INSTALL__: 'false',
    //   __FEATURE_LEGACY_API__: 'false',
    //   __VUE_I18N_FULL_INSTALL__: 'false',
    //   __VUE_I18N_LEGACY_API__: 'false',
    // },

    resolve: {
      alias: {
        '@valaxyjs/client': `${path.resolve(options.clientRoot, 'src')}/`,
        'valaxy/package.json': `${path.resolve(options.clientRoot, '../../package.json')}`,
        'valaxy': `${path.resolve(options.clientRoot, '..')}`,
        '~/': `${path.resolve(options.clientRoot, 'src')}/`,
        [VALAXY_CONFIG_ID]: `/${VALAXY_CONFIG_ID}`,
        '@valaxyjs/core': `${path.resolve(options.clientRoot, '../core')}`,
        [`valaxy-theme-${options.theme}`]: `${path.resolve(options.themeRoot)}/`,
      },
    },

    root: options.clientRoot,
    // todo user base
    // base: '/',

    plugins: ViteValaxyPlugins(options, serverOptions, mode),

    server: {
      fs: {
        allow: [
          searchForWorkspaceRoot(options.clientRoot),
          searchForWorkspaceRoot(options.userRoot),
          searchForWorkspaceRoot(options.themeRoot),
        ],
      },
    },

    optimizeDeps: {
      entries: [path.resolve(options.clientRoot, 'src/main.ts'), configFile],

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

  if (mode === 'build') {
    // https://github.com/antfu/vite-ssg
    viteConfig.ssgOptions = {
      script: 'async',
      formatting: 'minify',
      onFinished() { generateSitemap() },
    }
  }

  return viteConfig
}
