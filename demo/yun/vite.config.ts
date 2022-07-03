import { defineConfig } from 'vite'
// import { VitePWA } from 'vite-plugin-pwa'

import config from 'valaxy.config'

const safelist = [
  'i-ri-home-line',
]

/**
 * add your icon to safelist
 * if your theme is not yun, so you can add it by yourself
 */
config.themeConfig?.pages?.forEach((item) => {
  item?.icon && safelist?.push(item?.icon)
})

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
  },
})
