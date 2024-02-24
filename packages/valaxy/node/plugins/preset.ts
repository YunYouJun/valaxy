import type { PluginOption } from 'vite'
import { splitVendorChunkPlugin } from 'vite'

import Vue from '@vitejs/plugin-vue'
import Layouts from 'vite-plugin-vue-layouts'
import Components from 'unplugin-vue-components/vite'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'

import UnheadVite from '@unhead/addons/vite'

import { resolve } from 'pathe'
import type { ResolvedValaxyOptions, ValaxyServerOptions } from '../options'

import { customElements } from '../constants'
import { createUnocssPlugin } from './unocss'
import { createConfigPlugin } from './extendConfig'
import { createClientSetupPlugin } from './setupClient'
import { createFixPlugins } from './patchTransform'
import { createRouterPlugin } from './vueRouter'
import { createValaxyLoader } from './valaxy'
import { createMarkdownPlugin } from './markdown'

export async function ViteValaxyPlugins(
  options: ResolvedValaxyOptions,
  serverOptions: ValaxyServerOptions = {},
): Promise<(PluginOption | PluginOption[])[]> {
  const { roots, config: valaxyConfig } = options

  const MarkdownPlugin = await createMarkdownPlugin(options)
  const ValaxyLoader = await createValaxyLoader(options, serverOptions)

  return [
    MarkdownPlugin,
    createConfigPlugin(options),
    createClientSetupPlugin(options),
    Vue({
      include: [/\.vue$/, /\.md$/],
      exclude: [],
      template: {
        compilerOptions: {
          isCustomElement: (tag) => {
            let is = customElements.has(tag)
            valaxyConfig.vue?.isCustomElement?.forEach((fn) => {
              is = is || fn(tag)
            })
            return is
          },
        },
      },
      ...valaxyConfig.vue,
    }),

    ValaxyLoader,

    UnheadVite(),

    // https://github.com/posva/unplugin-vue-router
    createRouterPlugin(options),

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
      exclude: [],

      // allow override
      allowOverrides: true,
      // override: user -> theme -> client
      // latter override former
      dirs: roots
        .map(root => `${root}/components`)
        .concat(['src/components', 'components']),
      dts: resolve(options.tempDir, 'components.d.ts'),

      ...valaxyConfig.components,
    }),

    // https://github.com/antfu/unocss
    // UnocssPlugin,
    await createUnocssPlugin(options),

    // ...MarkdownPlugin,

    // https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      include: roots.map(root => `${root}/locales/**`),
    }),

    splitVendorChunkPlugin(),
    createFixPlugins(options),
  ]
}
