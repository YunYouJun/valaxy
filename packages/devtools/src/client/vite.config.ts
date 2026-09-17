import type { UserConfig } from 'vite'

import path from 'node:path'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import Vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import VueComponents from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import VueDevtools from 'vite-plugin-vue-devtools'
import VueRouter from 'vue-router/vite'

import { ValaxyDevtools } from '../node'

export default defineConfig((): UserConfig => {
  return {
    base: './',

    publicDir: path.resolve(__dirname, 'public'),

    resolve: {
      alias: {
        '~/': __dirname,
      },
    },

    devtools: { apply: 'serve', mcp: false },

    plugins: [
      VueRouter({
        routesFolder: path.join(__dirname, 'pages'),
        dts: path.join(__dirname, 'route-map.d.ts'),
      }),
      Vue({
        include: [/\.vue$/, /\.md$/],
      }),
      VueComponents({
        dirs: [path.join(__dirname, 'components')],
        dts: path.join(__dirname, 'components.d.ts'),
      }),
      Unocss({ configFile: path.resolve(__dirname, 'uno.config.ts') }),

      // https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
      VueI18n({
        runtimeOnly: true,
        compositionOnly: true,
        fullInstall: true,
        include: [path.resolve(__dirname, 'locales/**')],
      }),

      VueDevtools(),

      ValaxyDevtools({
        userRoot: path.resolve(__dirname, '../../../../demo/yun'),
      }),
    ],

    optimizeDeps: {
      include: [
        'dayjs',
        'dayjs/locale/zh-cn',
        'dayjs/plugin/relativeTime',
        '@vueuse/core',
      ],
      exclude: [
        'valaxy',
        '@valaxyjs/devtools',
      ],
    },

    build: {
      outDir: path.resolve(__dirname, '../../dist/client'),
    },

    ssr: {
      // TODO: workaround until they support native ESM
      noExternal: ['workbox-window', /vue-i18n/],
    },
  }
})
