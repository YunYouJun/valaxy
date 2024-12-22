import path from 'node:path'
import { componentsDir } from '@advjs/gui/node'

import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import Vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import VueComponents from 'unplugin-vue-components/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import VueDevtools from 'vite-plugin-vue-devtools'
import { unoConfig } from '../../../../uno.config'
import { config } from '../config'

import { ValaxyDevtools } from '../node'

export default defineConfig(() => {
  return {
    base: './',

    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },

    resolve: {
      alias: {
        '~/': __dirname,
      },
    },

    server: {
      proxy: {
        /**
         * 代理以便直接在 localhost:5001 上开发测试
         *
         * http://localhost:5001/_mockery_api_/xxx => http://localhost:5002/_mockery_api_/xxx
         */
        '^/trpc/.*': {
          target: `http://localhost:${config.serverPort}`,
          changeOrigin: true,
        },
      },
      cors: true,
    },

    plugins: [
      {
        name: 'local-object-transform',
        transform: {
          order: 'post',
          async handler(code) {
            return `${code}\n/* Injected with object hook! */`
          },
        },
      },
      {
        name: 'generate-error',
        load(id) {
          if (id === '/__LOAD_ERROR')
            throw new Error('Load error')
          if (id === '/__TRANSFORM_ERROR')
            return 'transform'
        },
        transform(code, id) {
          if (id === '/__TRANSFORM_ERROR')
            throw new SyntaxError('Transform error')
        },
      },

      {
        name: 'no-change',
        transform: {
          order: 'post',
          async handler(code) {
            return code
          },
        },
      },

      VueRouter({
        routesFolder: path.join(__dirname, 'pages'),
        dts: path.join(__dirname, 'typed-routes.d.ts'),
      }),
      Vue({
        include: [/\.vue$/, /\.md$/],
      }),
      VueComponents({
        dirs: ['components', componentsDir],
        dts: path.join(__dirname, 'components.d.ts'),
      }),
      Unocss(unoConfig),

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
        'primevue/datepicker',
        '@vueuse/core',
      ],
      exclude: [
        'valaxy',
        '@valaxyjs/devtools',
        'vite-hot-client',
        'vite-dev-rpc',
      ],
    },

    build: {
      target: 'esnext',
      outDir: path.resolve(__dirname, '../../dist/client'),
      minify: false, // 'esbuild',
      emptyOutDir: true,
    },

    ssr: {
      // TODO: workaround until they support native ESM
      noExternal: ['workbox-window', /vue-i18n/],
    },
  }
})
