import { defineConfig } from 'vite'
// import { VitePWA } from 'vite-plugin-pwa'

const safelist = [
  'i-ri-home-line',
]

export default defineConfig({
  plugins: [
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.svg', 'safari-pinned-tab.svg'],
    //   manifest: {
    //     name: valaxyConfig.title || 'Theme Yun',
    //     short_name: valaxyConfig.title || 'Yun',
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
