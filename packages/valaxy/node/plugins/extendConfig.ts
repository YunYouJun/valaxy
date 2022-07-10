import { dirname, join, resolve } from 'path'
import type { InlineConfig, Plugin } from 'vite'
import { mergeConfig } from 'vite'
import isInstalledGlobally from 'is-installed-globally'
import type { ResolvedValaxyOptions } from '../options'
import { resolveImportPath, toAtFS } from '../utils'

export function createConfigPlugin(options: ResolvedValaxyOptions): Plugin {
  return {
    name: 'valaxy:config',

    config(config) {
      const injection: InlineConfig = {
        root: options.clientRoot,
        publicDir: join(options.userRoot, 'public'),

        define: getDefine(options),
        resolve: {
          alias: {
            '~/': `${toAtFS(options.userRoot)}/`,
            'valaxy/client/': `${toAtFS(options.clientRoot)}/`,
            'valaxy/package.json': toAtFS(resolve(options.clientRoot, '../package.json')),
            'valaxy': toAtFS(resolve(options.clientRoot, 'index.ts')),
            '@valaxyjs/client/': `${toAtFS(options.clientRoot)}/`,
            [`valaxy-theme-${options.theme}/`]: `${toAtFS(resolve(options.themeRoot))}/`,
            [`valaxy-theme-${options.theme}`]: `${toAtFS(resolve(options.themeRoot))}/client/index.ts`,
          },
        },

        optimizeDeps: {
          // do not entry node file
          entries: [resolve(options.clientRoot, 'main.ts')],

          // must need it
          include: [
            'vue',
            'vue-router',
            '@vueuse/head',
            'dayjs',
            'nprogress',
            'katex',
          ],

          exclude: [
            'unocss',
            '@vueuse/core',
            '@vueuse/shared',
            'vue-demi',
          ],
        },

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

      if (isInstalledGlobally) {
        injection.cacheDir = join(options.pkgRoot, 'node_modules/.vite')
        // @ts-expect-error type cast
        injection.resolve.alias.vue = `${resolveImportPath('vue/dist/vue.esm-browser.js', true)}`
      }
      return mergeConfig(config, injection)
    },
  }
}

export function getDefine(options: ResolvedValaxyOptions): Record<string, any> {
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

  return {
    __DEV__: options.mode === 'dev' ? 'true' : 'false',
    __ALGOLIA__: !!options.config.search.algolia.enable,
  }
}
