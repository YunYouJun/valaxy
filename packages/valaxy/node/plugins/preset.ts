import type { PluginOption } from 'vite'

import type { ValaxyNode, ValaxyServerOptions } from '../types'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'

import UnheadVite from '@unhead/addons/vite'

import { consola } from 'consola'
import { resolve } from 'pathe'
import Components from 'unplugin-vue-components/vite'

import Layouts from 'vite-plugin-vue-layouts'
import { groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import { customElements } from '../constants'
import { scanCodeBlockTitles } from '../utils/groupIcons'
import { createCdnPlugin } from './cdn'
import { createConfigPlugin } from './extendConfig'
import { createLlmsPlugin } from './llms'
import { localSearchPlugin } from './localSearchPlugin'

import { createMarkdownPlugin } from './markdown'
import { createFixPlugins } from './patchTransform'
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
  const [
    MarkdownPlugin,
    ValaxyPlugin,
    vuePlugin,
    RouterPlugin,
    UnocssPlugin,
    LocalSearchPlugin,
    scannedTitles,
  ] = await Promise.all([
    createMarkdownPlugin(options),
    createValaxyPlugin(options, serverOptions),
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
    ),
    createRouterPlugin(valaxyApp),
    createUnocssPlugin(options),
    localSearchPlugin(options),
    scanCodeBlockTitles(options),
  ])

  /**
   * for unplugin-vue-components
   */
  const componentsDirs = roots
    .map(root => `${root}/components`)
    .concat(['src/components', 'components'])

  const plugins: (PluginOption | PluginOption[])[] = [
    createCdnPlugin(options),
    createLlmsPlugin(options),

    MarkdownPlugin,
    ValaxyPlugin,
    vuePlugin,
    createConfigPlugin(options),
    createClientSetupPlugin(options),

    UnheadVite(),

    // https://github.com/posva/unplugin-vue-router
    RouterPlugin,

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts({
      layoutsDirs: roots.map(root => `${root}/layouts`),

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

    createFixPlugins(options),

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
  return plugins
}
