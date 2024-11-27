import { join, resolve } from 'node:path'
import { componentsDir } from '@advjs/gui/node'
import Vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import VueComponents from 'unplugin-vue-components/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import { unoConfig } from '../../../../uno.config'

export default defineConfig({
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
      routesFolder: join(__dirname, 'pages'),
      dts: join(__dirname, 'typed-routes.d.ts'),
    }),
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),
    VueComponents({
      dirs: ['components', componentsDir],
      dts: join(__dirname, 'components.d.ts'),
    }),
    Unocss(unoConfig),
  ],

  optimizeDeps: {
    exclude: [
      'vite-hot-client',
    ],
  },

  build: {
    target: 'esnext',
    outDir: resolve(__dirname, '../../dist/client'),
    minify: false, // 'esbuild',
    emptyOutDir: true,
  },
})
