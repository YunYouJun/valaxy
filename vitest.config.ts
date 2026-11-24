import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import { configDefaults, defineConfig } from 'vitest/config'
import { createCoverComponentsPlugin } from './packages/valaxy/node/plugins/coverComponents'

const demoDistTests = ['test/build/demo.test.ts', 'test/build/fuse.test.ts']
const runDemoDistTests = process.env.VALAXY_TEST_DEMO_DIST === '1'

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

    include: runDemoDistTests ? demoDistTests : ['test/**/*.test.ts'],
    ...runDemoDistTests ? {} : { exclude: [...configDefaults.exclude, ...demoDistTests] },
  },
})
