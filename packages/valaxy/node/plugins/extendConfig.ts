import type { Alias, AliasOptions, InlineConfig, Plugin } from 'vite'
import type { ResolvedValaxyOptions } from '../options'
import { dirname, join, resolve } from 'node:path'
import { uniq } from '@antfu/utils'
import { mergeConfig, searchForWorkspaceRoot } from 'vite'
import { getIndexHtml } from '../common'
import { isInstalledGlobally, resolveImportPath, toAtFS } from '../utils'

/**
 * dependencies used by client
 */
const clientDeps = [
  // https://cn.vite.dev/guide/dep-pre-bundling.html#the-why
  'dayjs',
  'dayjs/locale/en',
  'dayjs/locale/zh-cn',
  'dayjs/plugin/relativeTime',
  'dayjs/plugin/timezone',
  'dayjs/plugin/utc',

  '@unhead/schema-org/vue',
  '@unhead/vue',

  'defu',

  'katex',
  'nprogress',
  'unocss',

  // vue
  'vue',
  'vue-router',

  'vue-i18n',
  // dev
  '@vue/devtools-api',

  // will may be addons
  'fuse.js',
  'medium-zoom',
  'vanilla-lazyload',

  'valaxy > @vueuse/integrations/useFuse',
]

/**
 * internal deps or esm deps do not need optimize
 */
const EXCLUDE = [
  '@docsearch/css',
  '@docsearch/js',

  // exclude for @waline/client/dist/component(use @vueuse/core) import
  '@vueuse/core',
  '@vueuse/shared',
  '@unocss/reset',
  'unocss',

  // addon, todo add externals for addon
  // main field error
  'meting',

  // internal
  'valaxy',
  'virtual:valaxy-addons:empty',
  '@valaxyjs/devtools',

  '/@valaxyjs/config',
  '/@valaxyjs/context',

  '/@valaxyjs/addons',
  '/@valaxyjs/locales',
  '/@valaxyjs/styles',

  /**
   * unplugin-vue-router
   * exclude to avoid vite optimize, will make Symbol('loaderEntries') valid
   */
  'unplugin-vue-router/data-loaders/basic',
]

export function createConfigPlugin(options: ResolvedValaxyOptions): Plugin {
  // const themeDeps = Object.keys((options.config.themeConfig.pkg.dependencies || {}))
  const addonDeps = options.addons.map(i => Object.keys(i.pkg.dependencies || {})).flat()
  const includedDeps = uniq([
    ...clientDeps,
    // remove theme deps, for primevue parse entry
    // ...themeDeps,
    // addon deps
    ...addonDeps,
  ]).filter(i => !EXCLUDE.includes(i))

  return {
    name: 'valaxy:site',
    // before devtools
    enforce: 'pre',
    async config(config) {
      const injection: InlineConfig = {
        // root: options.userRoot,
        // can not transform valaxy/client/*.ts when use userRoot
        root: options.clientRoot,
        // cacheDir: join(options.userRoot, 'node_modules/.vite'),
        cacheDir: join(options.userRoot, 'node_modules/.valaxy/cache'),
        publicDir: join(options.userRoot, 'public'),

        define: getDefine(options),
        resolve: {
          alias: await getAlias(options),
          dedupe: ['vue'],
        },

        optimizeDeps: {
          // do not entry node file
          entries: [resolve(options.clientRoot, 'main.ts')],

          // must need it
          include: includedDeps,
          exclude: EXCLUDE,
        },

        server: {
          fs: {
            allow: uniq([
              searchForWorkspaceRoot(options.clientRoot),
              searchForWorkspaceRoot(options.themeRoot),
              searchForWorkspaceRoot(options.userRoot),
              dirname(await resolveImportPath('katex/package.json', true)),
            ]),
          },
        },
      }

      if (isInstalledGlobally) {
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

export async function getAlias(options: ResolvedValaxyOptions): Promise<AliasOptions> {
  const alias: Alias[] = [
    /**
     * virtual module alias
     * `/` 开头无法 declare module 类型
     *
     * #valaxy/* => /@valaxyjs/*
     */
    { find: /^#valaxy\/(.*)/, replacement: '/@valaxyjs/$1' },

    { find: '~/', replacement: `${toAtFS(options.userRoot)}/` },
    { find: 'valaxy/client/', replacement: `${toAtFS(options.clientRoot)}/` },
    { find: 'valaxy/package.json', replacement: toAtFS(resolve(options.clientRoot, '../package.json')) },
    { find: /^valaxy$/, replacement: toAtFS(resolve(options.clientRoot, 'index.ts')) },
    { find: '@valaxyjs/client/', replacement: `${toAtFS(options.clientRoot)}/` },
    // import theme
    { find: 'virtual:valaxy-theme', replacement: `${toAtFS(options.themeRoot)}/client/index.ts` },
    { find: `valaxy-theme-${options.theme}/client`, replacement: `${toAtFS(resolve(options.themeRoot))}/client/index.ts` },
    { find: `valaxy-theme-${options.theme}/`, replacement: `${toAtFS(resolve(options.themeRoot))}/` },
    { find: `valaxy-theme-${options.theme}`, replacement: `${toAtFS(resolve(options.themeRoot))}/client/index.ts` },
  ]

  if (options.config.vue?.browserTemplateCompilation) {
    alias.push(
      { find: /^vue$/, replacement: await resolveImportPath('vue/dist/vue.esm-bundler.js', true) },
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
