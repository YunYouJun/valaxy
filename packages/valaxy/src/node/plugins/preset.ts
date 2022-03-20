import path from 'path'
import type { PluginOption } from 'vite'

import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import Components from 'unplugin-vue-components/vite'
import { VitePWA } from 'vite-plugin-pwa'
import VueI18n from '@intlify/vite-plugin-vue-i18n'
import Inspect from 'vite-plugin-inspect'

import type { ResolvedValaxyOptions, ValaxyServerOptions } from '../options'
import type { Mode } from '../vite'
import { createMarkdownPlugin } from './markdown'
import { createUnocssPlugin } from './unocss'
import { createValaxyPlugin } from '.'

export function ViteValaxyPlugins(options: ResolvedValaxyOptions, serverOptions: ValaxyServerOptions = {}, mode: Mode = 'dev'): (PluginOption | PluginOption[])[] | undefined {
  const { clientRoot, themeRoot, userRoot } = options

  const MarkdownPlugin = createMarkdownPlugin(options)
  const UnocssPlugin = createUnocssPlugin(options)

  const ValaxyPlugin = createValaxyPlugin(options, serverOptions)

  return [
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),

    ValaxyPlugin,
    MarkdownPlugin,

    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extensions: ['vue', 'md'],
      dirs: [`${clientRoot}/src/pages`, `${themeRoot}/src/pages`, `${userRoot}/pages`],
    }),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts({
      layoutsDirs: [`${clientRoot}/src/layouts`, `${themeRoot}/src/layouts`, `${userRoot}/layouts`],
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md'],
      dirs: [`${clientRoot}/src/components`, `${themeRoot}/src/components`, `${userRoot}/components`],

      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
    }),

    // https://github.com/antfu/unocss
    // UnocssPlugin,
    UnocssPlugin,

    // https://github.com/antfu/vite-plugin-pwa
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'safari-pinned-tab.svg'],
      manifest: {
        name: 'Theme Yun',
        short_name: 'Yun',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),

    // https://github.com/intlify/bundle-tools/tree/main/packages/vite-plugin-vue-i18n
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      include: [path.resolve(clientRoot, 'locales/**'), `${options.userRoot}/locales/**`],
    }),

    // https://github.com/antfu/vite-plugin-inspect
    // Visit http://localhost:3333/__inspect/ to see the inspector
    mode === 'dev' && Inspect(),
  ]
}
