import { dirname, join } from 'path'
import type { InlineConfig } from 'vite'
import { splitVendorChunkPlugin } from 'vite'
import type { ResolvedValaxyOptions, ValaxyServerOptions } from './options'

import { ViteValaxyPlugins } from './plugins/preset'
import { resolveImportPath } from './utils'

export type Mode = 'dev' | 'build'

export async function createViteConfig(options: ResolvedValaxyOptions, serverOptions: ValaxyServerOptions = {}): Promise<InlineConfig> {
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

    // always string
    define: {
      __DEV__: options.mode === 'dev' ? 'true' : 'false',

      __ALGOLIA__: !!options.config.search.algolia.enable,
    },

    root: options.clientRoot,
    publicDir: join(options.userRoot, 'public'),

    // https://vitejs.dev/guide/build.html#chunking-strategy
    plugins: [await ViteValaxyPlugins(options, serverOptions, {}), splitVendorChunkPlugin()],

    server: {
      fs: {
        allow: [
          // not need to search workspace root
          options.clientRoot,
          options.themeRoot,
          options.userRoot,
          dirname(resolveImportPath('katex/package.json', true)),
        ],
      },
    },
  }

  return viteConfig
}