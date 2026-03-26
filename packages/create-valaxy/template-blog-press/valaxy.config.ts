import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  theme: 'press',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
    ],
    sidebar: [],
    footer: {
      message: 'Powered by <a href="https://valaxy.site">Valaxy</a>',
    },
  },
})
