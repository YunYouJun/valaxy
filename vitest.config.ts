import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import { createCoverComponentsPlugin } from './packages/valaxy/node/plugins/coverComponents'

export default defineConfig({
  plugins: [vue(), createCoverComponentsPlugin([])],
  test: {
    // Integration tests also start TypeDoc/Vite children; bound CPU and memory use while keeping unit tests fast.
    maxWorkers: process.env.CI ? 3 : 4,
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
