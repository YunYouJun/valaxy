// import path from 'node:path'
// import { toAtFS } from 'valaxy'
import { defineConfig } from 'vite'

// vite plugins
// import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: {
      // for dev
      // '@valaxyjs/devtools/': `${toAtFS(path.resolve(__dirname, '../../packages/devtools'))}/`,
      // '@valaxyjs/devtools': toAtFS(path.resolve(__dirname, '../../packages/devtools/src/index.ts')),
    },
  },

  plugins: [
    // https://vite-pwa-org.netlify.app/
    // VitePWA(),
  ],

  preview: {
    // default is 4173
    port: 4173,
  },
})
