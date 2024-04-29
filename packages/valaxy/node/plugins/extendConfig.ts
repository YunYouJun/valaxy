import { dirname, join, resolve } from 'node:path'
import type { Alias, AliasOptions, InlineConfig, Plugin } from 'vite'
import { mergeConfig, searchForWorkspaceRoot } from 'vite'
import isInstalledGlobally from 'is-installed-globally'
import { uniq } from '@antfu/utils'
import { getIndexHtml } from '../common'
import type { ResolvedValaxyOptions } from '../options'
import { resolveImportPath, toAtFS } from '../utils'

/**
 * dependencies used by client
 */
const clientDeps = [
  '@unhead/schema-org',
  '@unhead/vue',

  '@vueuse/integrations/useFuse',
  'body-scroll-lock',

  'defu',

  'katex',
  'nprogress',
  'unocss',
  'vue',
  'vue-router',
  'vue-i18n',

  // will may be addons
  'fuse.js',
  'medium-zoom',
  'vanilla-lazyload',

  // dev
  '@vue/devtools-api',
]

/**
 * internal deps or esm deps do not need optimize
 */
const EXCLUDE = [
  '@docsearch/css',

  '@vueuse/core',
  '@vueuse/shared',
  '@unocss/reset',
  'unocss',

  'vue',
  // 'vue-i18n',
  'vue-router',
  'vue-demi',
  '@vue/devtools-api',

  // addon, todo add externals for addon
  // main field error
  'meting',

  // internal
  'valaxy',
  '/@valaxyjs/config',
  '/@valaxyjs/context',

  '/@valaxyjs/addons',
  '/@valaxyjs/locales',
  '/@valaxyjs/styles',
]

export function createConfigPlugin(options: ResolvedValaxyOptions): Plugin {
  const themeDeps = Object.keys((options.config.themeConfig.pkg.dependencies || {}))
  const addonDeps = options.addons.map(i => Object.keys(i.pkg.dependencies || {})).flat()

  return {
    name: 'valaxy:site',
    // before devtools
    enforce: 'pre',
    config(config) {
      const injection: InlineConfig = {
        // root: options.userRoot,
        // can not transform valaxy/client/*.ts when use userRoot
        root: options.clientRoot,
        cacheDir: join(options.userRoot, 'node_modules/.vite'),
        publicDir: join(options.userRoot, 'public'),

        define: getDefine(options),
        resolve: {
          alias: getAlias(options),
          dedupe: ['vue'],
        },

        optimizeDeps: {
          // do not entry node file
          entries: [resolve(options.clientRoot, 'main.ts')],

          // must need it
          include: uniq([
            ...clientDeps,
            // theme deps
            ...themeDeps,
            // addon deps
            ...addonDeps,
          ]).filter(i => !EXCLUDE.includes(i)),

          exclude: EXCLUDE,
        },

        server: {
          fs: {
            allow: uniq([
              searchForWorkspaceRoot(options.clientRoot),
              searchForWorkspaceRoot(options.themeRoot),
              searchForWorkspaceRoot(options.userRoot),
              dirname(resolveImportPath('katex/package.json', true)),
            ]),
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

    async transformIndexHtml(html) {
      // console.log(toAtFS(options.clientRoot))
      html = await getIndexHtml(options, html)
      return {
        html,
        tags: [],
      }
    },
  }
}

export function getDefine(_options: ResolvedValaxyOptions): Record<string, any> {
  // remove vue-i18n warnings
  // https://vue-i18n.intlify.dev/guide/advanced/optimization.html#reduce-bundle-size-with-feature-build-flags
  // https://github.com/antfu/vitesse/issues/131
  // https://github.com/intlify/vue-i18n-next/blob/dab6db19a1ef917425939275a41dfde9b6c61fe9/packages/vue-i18n-core/src/misc.ts#L20
  // I create a issue https://github.com/intlify/vue-i18n-next/issues/961

  return {
    __VUE_PROD_DEVTOOLS__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
  }
}

export function getAlias(options: ResolvedValaxyOptions): AliasOptions {
  const alias: Alias[] = [
    { find: '~/', replacement: `${toAtFS(options.userRoot)}/` },
    { find: 'valaxy/client/', replacement: `${toAtFS(options.clientRoot)}/` },
    { find: 'valaxy/package.json', replacement: toAtFS(resolve(options.clientRoot, '../package.json')) },
    { find: /^valaxy$/, replacement: toAtFS(resolve(options.clientRoot, 'index.ts')) },
    { find: '@valaxyjs/client/', replacement: `${toAtFS(options.clientRoot)}/` },
    { find: `valaxy-theme-${options.theme}/`, replacement: `${toAtFS(resolve(options.themeRoot))}/` },
    { find: `valaxy-theme-${options.theme}`, replacement: `${toAtFS(resolve(options.themeRoot))}/client/index.ts` },
  ]

  // for runtime compile vue, encrypt and decrypt
  // type cast
  if (options.config.siteConfig.encrypt.enable) {
    alias.push(
      { find: /^vue$/, replacement: resolveImportPath('vue/dist/vue.esm-bundler.js', true) },
    )
  }

  options.addons.forEach((addon) => {
    // without alias 'valaxy-addon-xxx/', import { xxx } from 'valaxy-addon-name' works well
    alias.push({
      find: `${addon.name}/client/`,
      replacement: `${toAtFS(`${resolve(addon.root)}`)}/client/`,
    })
    alias.push({
      find: `${addon.name}/App.vue`,
      replacement: `${toAtFS(resolve(addon.root))}/App.vue`,
    })
    alias.push({
      find: addon.name,
      replacement: `${toAtFS(resolve(addon.root))}/client/index.ts`,
    })
  })
  // do not need it
  // alias.push(...[
  //   { find: /^valaxy-addon-(.*)$/, replacement: toAtFS(resolve(options.themeRoot, '../valaxy-addon-$1/client/index.ts')) },
  // ])

  // adapt for not exist addon
  alias.push({
    find: /^valaxy-addon-(.*)$/,
    replacement: toAtFS(resolve(options.clientRoot, './addons/index.ts')),
  })

  return alias
}
