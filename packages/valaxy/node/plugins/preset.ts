import type { PluginOption } from 'vite'

import type { ValaxyNode, ValaxyServerOptions } from '../types'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'

import UnheadVite from '@unhead/addons/vite'

import { consola } from 'consola'
import { resolve } from 'pathe'
import Components from 'unplugin-vue-components/vite'

import Layouts from 'vite-plugin-vue-layouts-next'
import { groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import { customElements } from '../constants'
import { vLogger } from '../logger'
import { scanCodeBlockTitles } from '../utils/groupIcons'
import { countPerformanceTime } from '../utils/performance'
import { createCdnPlugin } from './cdn'
import { createConfigPlugin } from './extendConfig'
import { createLlmsPlugin } from './llms'
import { localSearchPlugin } from './localSearchPlugin'

import { createMarkdownPlugin, disposeMdItInstance, disposePreviewMdItInstance } from './markdown'
import { disposeSharedHighlighter } from './markdown/highlighterCache'
import { clearMarkdownCache } from './markdown/markdownToVue'
import { createClientSetupPlugin } from './setupClient'

import { createUnocssPlugin } from './unocss'
import { createValaxyPlugin } from './valaxy'
import { createRouterPlugin } from './vueRouter'

export async function ViteValaxyPlugins(
  valaxyApp: ValaxyNode,
  serverOptions: ValaxyServerOptions = {},
): Promise<(PluginOption | PluginOption[])[]> {
  const { options } = valaxyApp
  const { roots, config: valaxyConfig } = options

  // Parallelise heavy async plugin initialisations.
  // createMarkdownPlugin (shiki highlighter) and createUnocssPlugin (jiti config
  // loading) are the two slowest — running them concurrently with the other
  // async factories cuts total startup time significantly.
  const timers = {
    markdown: countPerformanceTime(),
    valaxy: countPerformanceTime(),
    vue: countPerformanceTime(),
    router: countPerformanceTime(),
    unocss: countPerformanceTime(),
    localSearch: countPerformanceTime(),
    scanTitles: countPerformanceTime(),
  }
  const [
    MarkdownPlugin,
    ValaxyPlugin,
    vuePlugin,
    RouterPlugin,
    UnocssPlugin,
    LocalSearchPlugin,
    scannedTitles,
  ] = await Promise.all([
    createMarkdownPlugin(options).then((r) => {
      vLogger.debug(`  ├─ createMarkdownPlugin: ${timers.markdown()}`)
      return r
    }),
    createValaxyPlugin(options, serverOptions).then((r) => {
      vLogger.debug(`  ├─ createValaxyPlugin: ${timers.valaxy()}`)
      return r
    }),
    import('@vitejs/plugin-vue').then(r =>
      r.default({
        include: /\.(?:vue|md)$/,
        exclude: [],
        ...valaxyConfig.vue,
        template: {
          ...valaxyConfig.vue?.template,
          compilerOptions: {
            ...valaxyConfig.vue?.template?.compilerOptions,
            isCustomElement: (tag) => {
              let is = customElements.has(tag)
              valaxyConfig.vue?.isCustomElement?.forEach((fn) => {
                is = is || fn(tag)
              })
              return is
            },
          },
        },
      }),
    ).then((r) => {
      vLogger.debug(`  ├─ plugin-vue: ${timers.vue()}`)
      return r
    }),
    createRouterPlugin(valaxyApp).then((r) => {
      vLogger.debug(`  ├─ createRouterPlugin: ${timers.router()}`)
      return r
    }),
    createUnocssPlugin(options).then((r) => {
      vLogger.debug(`  ├─ createUnocssPlugin: ${timers.unocss()}`)
      return r
    }),
    localSearchPlugin(options).then((r) => {
      vLogger.debug(`  ├─ localSearchPlugin: ${timers.localSearch()}`)
      return r
    }),
    scanCodeBlockTitles(options).then((r) => {
      vLogger.debug(`  └─ scanCodeBlockTitles: ${timers.scanTitles()}`)
      return r
    }),
  ])

  /**
   * for unplugin-vue-components
   */
  const componentsDirs = [...roots
    .map(root => `${root}/components`), ...['src/components', 'components']]

  const plugins: (PluginOption | PluginOption[])[] = [
    createCdnPlugin(options),
    createLlmsPlugin(options),

    MarkdownPlugin,
    ValaxyPlugin,
    vuePlugin,
    createConfigPlugin(options),
    createClientSetupPlugin(options),

    UnheadVite(),

    // https://router.vuejs.org/file-based-routing/
    RouterPlugin,

    // https://github.com/loicduong/vite-plugin-vue-layouts-next
    Layouts({
      layoutsDirs: roots.map(root => `${root}/layouts`),

      // In SSG builds, layout components must be imported synchronously so that
      // the client-side hydration tree matches the server-rendered HTML. Without
      // this, non-default layouts (post, home, etc.) are lazy-loaded and haven't
      // resolved when hydration starts, causing a mismatch. The old vite-ssg
      // library handled this by setting VITE_SSG=true; the built-in SSG engine
      // needs an explicit importMode override instead.
      ...(options.mode === 'build' ? { importMode: () => 'sync' as const } : {}),

      ...valaxyConfig.layouts,
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      extensions: ['vue', 'md'],

      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      /**
       * 默认排除 components/.exclude
       * `/[\\/]node_modules[\\/]/, ` 不要排除 node_modules/valaxy/client/components 下的组件
       */
      exclude: [/[\\/]\.git[\\/]/, /[\\/]\.exclude[\\/]/],

      // allow override
      allowOverrides: true,
      /**
       * override: user -> theme -> client
       *
       * latter override former
       */
      dirs: componentsDirs,
      dts: resolve(options.tempDir, 'components.d.ts'),

      ...valaxyConfig.components,
    }),

    // https://github.com/antfu/unocss
    UnocssPlugin,

    // https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      fullInstall: true,
      include: roots.map(root => `${root}/locales/**`),
    }),

    // localSearch
    LocalSearchPlugin,
  ]

  if (valaxyConfig.visualizer) {
    try {
      const visualizer = (await import('rollup-plugin-visualizer')).visualizer
      plugins.push(
        visualizer({
          open: true,
          gzipSize: true,
          ...valaxyConfig.visualizer,
        }),
      )
    }
    catch (e) {
      console.error(e)
      consola.error('Failed to load rollup-plugin-visualizer')
      consola.error('Please install `rollup-plugin-visualizer` to enable the feature')
      // eslint-disable-next-line no-console
      console.log()
      consola.info('pnpm add -D rollup-plugin-visualizer')
      // eslint-disable-next-line no-console
      console.log()
    }
  }

  const builtinCustomIcon = {
    nodejs: 'vscode-icons:file-type-node',
    playwright: 'vscode-icons:file-type-playwright',
    typedoc: 'vscode-icons:file-type-typedoc',
    eslint: 'vscode-icons:file-type-eslint',
  }

  const groupIconPlugin = groupIconVitePlugin({
    customIcon: {
      ...builtinCustomIcon,
      ...valaxyConfig.groupIcons?.customIcon,
    },
    defaultLabels: [
      ...valaxyConfig.groupIcons?.defaultLabels || [],
      ...Object.keys(builtinCustomIcon),
      ...Object.keys(valaxyConfig.groupIcons?.customIcon || {}),
      ...scannedTitles,
    ],
  })

  plugins.push(groupIconPlugin)

  // Release heavy resources after Vite builds complete.
  // Both the new Valaxy SSG engine and the legacy vite-ssg run two consecutive
  // builds (client + server). This plugin disposes Shiki, MarkdownIt, and other
  // heavy resources after the 2nd build. The new SSG engine also does its own
  // disposal in build/ssg.ts (redundant but harmless); the plugin hook clearing
  // below is specifically needed for the legacy vite-ssg path where its function
  // scope keeps closures alive.
  if (options.mode === 'build') {
    let buildCount = 0
    // Both SSG engines run two consecutive viteBuild() calls (client + server)
    // sharing the same plugin instances. Release heavy resources after the 2nd
    // closeBundle. Note: buildCount is scoped per ViteValaxyPlugins() call, so
    // separate build sequences (e.g. tests calling ViteValaxyPlugins again) each
    // get their own counter.
    //
    // We cannot release Shiki/MarkdownIt after the 1st build (client) because
    // the server build still needs to transform markdown files.
    const releaseThreshold = 2
    let resolvedConfig: any = null
    plugins.push({
      name: 'valaxy:memory-release',
      enforce: 'post',
      configResolved(config) {
        resolvedConfig = config
      },
      closeBundle() {
        buildCount++
        if (buildCount >= releaseThreshold) {
          disposeSharedHighlighter()
          disposeMdItInstance()
          disposePreviewMdItInstance()
          clearMarkdownCache()

          // Break closure chains by clearing heavy plugin hooks from the
          // resolved Vite config. After the server build completes, these
          // hooks will never be called again — both the new Valaxy SSG
          // engine and legacy vite-ssg only do page rendering from here.
          // This allows V8 to reclaim the large closures (Shiki grammar
          // data, UnoCSS engine, Rolldown module graph references, etc.)
          // that are otherwise kept alive by function scope holding `config`.
          if (resolvedConfig?.plugins) {
            const hookKeys = [
              'transform',
              'load',
              'resolveId',
              'buildStart',
              'buildEnd',
              'renderStart',
              'renderChunk',
              'generateBundle',
              'writeBundle',
              'moduleParsed',
              'resolveDynamicImport',
              'configResolved',
              'configureServer',
              'handleHotUpdate',
            ]
            for (const p of resolvedConfig.plugins) {
              if (p && typeof p === 'object') {
                for (const key of hookKeys) {
                  if (key in p)
                    (p as any)[key] = undefined
                }
              }
            }
            resolvedConfig = null
          }

          if (typeof globalThis.gc === 'function')
            globalThis.gc()
        }
      },
    })
  }

  return plugins
}
