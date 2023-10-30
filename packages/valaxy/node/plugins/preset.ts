import type { PluginOption } from 'vite'
import { splitVendorChunkPlugin } from 'vite'

import MarkdownIt from 'markdown-it'

import Vue from '@vitejs/plugin-vue'
import Layouts from 'vite-plugin-vue-layouts'
import Components from 'unplugin-vue-components/vite'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'

import UnheadVite from '@unhead/addons/vite'

import type { ResolvedValaxyOptions, ValaxyServerOptions } from '../options'
import { setupMarkdownPlugins } from '../markdown'

import { createUnocssPlugin } from './unocss'
import { createConfigPlugin } from './extendConfig'
import { createClientSetupPlugin } from './setupClient'
import { createFixPlugins } from './patchTransform'
import { createPagesPlugin } from './pages'
import { createValaxyPlugin } from './valaxy'

// for render markdown excerpt
export const mdIt = new MarkdownIt({ html: true })

export async function ViteValaxyPlugins(
  options: ResolvedValaxyOptions,
  serverOptions: ValaxyServerOptions = {},
): Promise<(PluginOption | PluginOption[])[] | undefined> {
  const { roots, config: valaxyConfig } = options

  // setup mdIt
  await setupMarkdownPlugins(mdIt, options, true)

  const customElements = new Set([
    // katex
    'annotation',
    'math',
    'menclose',
    'mfrac',
    'mglyph',
    'mi',
    'mlabeledtr',
    'mn',
    'mo',
    'mover',
    'mpadded',
    'mphantom',
    'mroot',
    'mrow',
    'mspace',
    'msqrt',
    'mstyle',
    'msub',
    'msubsup',
    'msup',
    'mtable',
    'mtd',
    'mtext',
    'mtr',
    'munder',
    'munderover',
    'semantics',

    // meting
    // will migrate to valaxy-addon-meting
    'meting-js',
  ])

  return [
    Vue({
      include: [/\.vue$/, /\.md$/],
      template: {
        compilerOptions: {
          isCustomElement: (tag) => {
            return customElements.has(tag)
          },
        },
        ...valaxyConfig.vue?.template,
      },
      ...valaxyConfig.vue,
    }),

    UnheadVite(),
    createConfigPlugin(options),
    createClientSetupPlugin(options),
    createValaxyPlugin(options, serverOptions),

    // https://github.com/hannoeru/vite-plugin-pages
    createPagesPlugin(options),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts({
      layoutsDirs: roots.map(root => `${root}/layouts`),
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
        .concat(roots.map(root => `${root}/layouts`))
        .concat(['src/components', 'components']),
      dts: `${options.userRoot}/components.d.ts`,

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
