import { defineValaxyConfig } from 'valaxy/node'

export default defineValaxyConfig({
  siteConfig: {
    author: {
      name: 'Valaxy.Config',
      email: '',
    },
  },

  themeConfig: {
    arr: [1, 2, 3],
    pages: [
      {
        name: 'Valaxy',
        url: 'https://valaxy.site/',
        icon: 'i-ri-heart-line',
        color: 'red',
      },
    ],
  },
})
