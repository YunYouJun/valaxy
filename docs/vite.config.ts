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
        },
        warning: {
          icon: 'i-carbon-warning-alt',
        },
        danger: {
          icon: 'i-carbon-warning',
        },
        info: {
          text: 'i-carbon-information',
        },
      },
    },
  },
})
