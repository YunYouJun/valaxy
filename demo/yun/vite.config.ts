import { defineConfig } from 'vite'
// import { VitePWA } from 'vite-plugin-pwa'
import Inspect from 'vite-plugin-inspect'

const safelist = [
  'i-ri-home-line',
]

export default defineConfig({
  plugins: [
    // https://github.com/antfu/vite-plugin-inspect
    // Visit http://localhost:3333/__inspect/ to see the inspector
    Inspect(),

    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.svg', 'safari-pinned-tab.svg'],
    //   manifest: {
    //     name: 'Theme Yun',
    //     short_name: 'Yun',
    //     theme_color: '#ffffff',
    //     icons: [
    //       {
    //         src: '/pwa-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //       },
    //       {
    //         src: '/pwa-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //       },
    //       {
    //         src: '/pwa-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any maskable',
    //       },
    //     ],
    //   },
    // }),
  ],

  valaxy: {
    unocss: {
      safelist,
    },

    markdown: {
      blocks: {
        tip: {
          icon: 'i-carbon-thumbs-up',
          text: 'ヒント',
          langs: {
            'zh-CN': '提示',
          },
        },
        warning: {
          icon: 'i-carbon-warning-alt',
          text: '注意',
        },
        danger: {
          icon: 'i-carbon-warning',
          text: '警告',
        },
        info: {
          text: 'información',
        },
      },
    },
  },
})
