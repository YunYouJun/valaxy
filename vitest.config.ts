import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import { createCoverComponentsPlugin } from './packages/valaxy/node/plugins/coverComponents'

export default defineConfig({
  plugins: [vue(), createCoverComponentsPlugin([])],
  test: {
    // Integration tests also start TypeDoc children; bound CPU and memory use.
    maxWorkers: 2,
    deps: {
      optimizer: {
        ssr: {
          include: ['@vue', '@vueuse'],
        },
      },
    },

    include: ['test/**/*.test.ts'],
  },
})
