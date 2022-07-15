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
