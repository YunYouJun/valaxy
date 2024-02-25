import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    deps: {
      optimizer: {
        ssr: {
          include: ['@vue', '@vueuse', 'vue-demi'],
        },
      },
    },

    include: ['test/**/*.test.ts'],
  },
})
