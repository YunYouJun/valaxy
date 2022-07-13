import { defineConfig } from 'vite'

const safelist = [
  'i-ri-home-line',
]

export default defineConfig({
  base: '/',
  plugins: [],
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
