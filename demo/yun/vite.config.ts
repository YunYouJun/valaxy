import { defineConfig } from 'vite'

// vite plugins
// import { VitePWA } from 'vite-plugin-pwa'
// import VueDevTools from 'vite-plugin-vue-devtools'
// import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [
    // not works, to be fixed
    // VueDevTools(),
    // VitePWA(),
    // https://github.com/antfu/vite-plugin-inspect
    // Visit http://localhost:3333/__inspect/ to see the inspector
    // Inspect(),
  ],
})
