import type { InlineConfig, Plugin, PluginOption } from 'vite'

import type { ValaxyNode, ValaxyServerOptions } from '../types'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'

import UnheadVite from '@unhead/addons/vite'

import { consola } from 'consola'
import { resolve } from 'pathe'
import Components from 'unplugin-vue-components/vite'

import Layouts from 'vite-plugin-vue-layouts-next'
import { groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import { StateManager } from '../app/state'
import { customElements } from '../constants'
import { vLogger } from '../logger'
import { scanCodeBlockTitles } from '../utils/groupIcons'
import { countPerformanceTime } from '../utils/performance'
import { createCdnPlugin } from './cdn'
import { createConfigPlugin } from './extendConfig'
import { createLlmsPlugin } from './llms'
import { localSearchPlugin } from './localSearchPlugin'

import { createMarkdownPlugin } from './markdown'
import { createMarkdownBaseContext } from './markdown/base'
import { clearMarkdownCache } from './markdown/markdownToVue'
import { createClientSetupPlugin } from './setupClient'

import { createUnocssPlugin } from './unocss'
import { createValaxyPlugin } from './valaxy'
import { createRouterPlugin } from './vueRouter'

export function createMemoryReleasePlugin(state: StateManager, releaseThreshold = 1): Plugin {
  let buildCount = 0
  let resourcesReleased = false
  let resolvedConfig: any = null

  const releaseResources = () => {
    if (resourcesReleased)
      return
    resourcesReleased = true
    state.dispose()
    clearMarkdownCache(state)
  }

  return {
    name: 'valaxy:memory-release',
    enforce: 'post',
    configResolved(config) {
      resolvedConfig = config
    },
    buildEnd(error) {
      // closeBundle is not guaranteed after a failed build.
      // Watch-mode errors are recoverable and later rebuilds still need these
      // resources and hooks.
      if (error && !this.meta?.watchMode)
        releaseResources()
    },
    closeBundle() {
      // Vite closes each watch result, not only the watcher itself.
      if (this.meta?.watchMode)
        return

      buildCount++
      if (buildCount < releaseThreshold)
        return

      releaseResources()

      // Break closure chains after the final build in this pipeline.
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
        for (const plugin of resolvedConfig.plugins) {
          if (plugin && typeof plugin === 'object') {
            for (const key of hookKeys) {
              if (key in plugin)
                plugin[key] = undefined
            }
          }
        }
        resolvedConfig = null
      }

      if (typeof globalThis.gc === 'function')
        globalThis.gc()
    },
  }
}

export async function ViteValaxyPlugins(
  valaxyApp: ValaxyNode,
  serverOptions: ValaxyServerOptions = {},
  viteConfig: InlineConfig = {},
  expectedBuilds = 1,
): Promise<(PluginOption | PluginOption[])[]> {
  const { options } = valaxyApp
  // Plugin pipelines can be created concurrently from the same Valaxy app.
  // Keep transient Markdown state scoped to this pipeline, not the app.
  const state = new StateManager()
  const { roots, config: valaxyConfig } = options
  const markdownBase = createMarkdownBaseContext(viteConfig.base || valaxyConfig.vite?.base || '/')

  const MarkdownBasePlugin: Plugin = {
    name: 'valaxy:markdown-base',
    enforce: 'pre',
    configResolved(config) {
      // Use the final Vite value so base contributed by vite.config.ts or a
      // plugin is shared by every Markdown renderer.
      markdownBase.value = config.base
    },
  }

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
    createMarkdownPlugin(options, markdownBase, state).then((r) => {
      vLogger.debug(`  ├─ createMarkdownPlugin: ${timers.markdown()}`)
      return r
    }),
    createValaxyPlugin(options, serverOptions, state).then((r) => {
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
    createRouterPlugin(valaxyApp, markdownBase).then((r) => {
      vLogger.debug(`  ├─ createRouterPlugin: ${timers.router()}`)
      return r
    }),
    createUnocssPlugin(options).then((r) => {
      vLogger.debug(`  ├─ createUnocssPlugin: ${timers.unocss()}`)
      return r
    }),
    localSearchPlugin(options, markdownBase).then((r) => {
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
    MarkdownBasePlugin,
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
      // resolved when hydration starts, causing a mismatch. The built-in SSG
      // engine needs an explicit importMode override to force synchronous imports.
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
  // The Valaxy SSG engine runs two consecutive builds (client + server). This
  // plugin disposes the pipeline state, Markdown cache, and Shiki highlighter
  // after the 2nd build. Hook clearing then frees closures the build pipeline
  // keeps alive.
  if (options.mode === 'build') {
    plugins.push(createMemoryReleasePlugin(state, expectedBuilds))
  }

  return plugins
}
