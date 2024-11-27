import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  vite: {
    optimizeDeps: {
      exclude: [
        '@docsearch/css',
        '@docsearch/js',
      ],
    },
  },
})
