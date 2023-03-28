import { dirname, join, resolve } from 'node:path'
import type { Alias, AliasOptions, InlineConfig, Plugin } from 'vite'
import { mergeConfig, searchForWorkspaceRoot } from 'vite'
import isInstalledGlobally from 'is-installed-globally'
import fs from 'fs-extra'
import { uniq } from '@antfu/utils'
import type { ResolvedValaxyOptions } from '../options'
import { resolveImportPath, toAtFS } from '../utils'
import { getIndexHtml } from '../common'

/**
 * dependencies used by client
 */
const clientDeps = [
  '@vueuse/schema-org',

  '@vueuse/head',
  '@vueuse/integrations/useFuse',
  'body-scroll-lock',

  'dayjs',
  'dayjs/locale/zh-cn',
  'dayjs/plugin/relativeTime',

  'katex',
  'nprogress',
  'unocss',
  'vue',
  'vue-router',
  'vue-i18n',

  // will may be addons
  'fuse.js',
  'medium-zoom',
]

/**
 * internal deps or esm deps do not need optimize
 */
const EXCLUDE = [
  '@vueuse/core',
  '@vueuse/shared',
  '@unocss/reset',
  'unocss',
  'vue',
  'vue-demi',

  // internal
  'valaxy',
  '/@valaxyjs/config',
  '/@valaxyjs/context',

  '/@valaxyjs/addons',
  '/@valaxyjs/locales',
  '/@valaxyjs/styles',
]

export function createConfigPlugin(options: ResolvedValaxyOptions): Plugin {
  return {
    name: 'valaxy:site',

    config(config) {
      const injection: InlineConfig = {
        // root: options.userRoot,
        // can not transform valaxy/client/*.ts when use userRoot
        root: options.clientRoot,
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
          include: [
            ...clientDeps.filter(i => !EXCLUDE.includes(i)),
          ],

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

    configureServer(server) {
      // serve our index.html after vite history fallback
      return () => {
        server.middlewares.use(async (req, res, next) => {
          if (req.url!.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html')
            res.statusCode = 200
            res.end(await getIndexHtml(options))
            return
          }
          // patch rss
          if (req.url! === '/atom.xml') {
            res.setHeader('Content-Type', 'application/xml')
            res.statusCode = 200
            res.end(await fs.readFile(resolve(options.userRoot, 'dist/atom.xml'), 'utf-8'))
            return
          }
          next()
        })
      }
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
  }
}

export function getAlias(options: ResolvedValaxyOptions): AliasOptions {
  const alias: Alias[] = [
    { find: '~/', replacement: `${toAtFS(options.userRoot)}/` },
    { find: 'valaxy/client/', replacement: `${toAtFS(options.clientRoot)}/` },
    { find: 'valaxy/package.json', replacement: toAtFS(resolve(options.clientRoot, '../package.json')) },
    { find: 'valaxy', replacement: toAtFS(resolve(options.clientRoot, 'index.ts')) },
    { find: '@valaxyjs/client/', replacement: `${toAtFS(options.clientRoot)}/` },
    { find: `valaxy-theme-${options.theme}/`, replacement: `${toAtFS(resolve(options.themeRoot))}/` },
    { find: `valaxy-theme-${options.theme}`, replacement: `${toAtFS(resolve(options.themeRoot))}/client/index.ts` },
  ]

  options.addons.forEach((addon) => {
    // without this, import { xxx } from 'valaxy-addon-name' works well
    // alias.push({
    //   find: `${addon.name}/`,
    //   replacement: `${toAtFS(`${resolve(addon.root)}`)}/`,
    // })
    alias.push({
      find: addon.name,
      replacement: `${toAtFS(resolve(addon.root))}/client/index.ts`,
    })
  })

  // alias.push(...[
  //   { find: /valaxy-addon-(.*)/, replacement: toAtFS(resolve(options.themeRoot, '../valaxy-addon-$1/client/index.ts')) },
  // ])
  return alias
}
