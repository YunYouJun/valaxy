import { defineConfig } from 'valaxy'

const safelist = [
  'i-ri-home-line',
]

export default defineConfig({
  title: 'Valaxy',
  url: 'https://valaxy.site',
  description: 'Valaxy Site Docs',

  theme: 'press',
  themeConfig: {},

  vite: {
    base: '/',
  },
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
})
