import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
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
