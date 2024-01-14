import { defineConfig } from 'vite'

// vite plugins
// import { VitePWA } from 'vite-plugin-pwa'

// import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [
    // VitePWA(),
    // https://github.com/antfu/vite-plugin-inspect
    // Visit http://localhost:3333/__inspect/ to see the inspector
    // Inspect(),
  ],

  optimizeDeps: {
    include: ['@waline/client/component'],
  },
})
