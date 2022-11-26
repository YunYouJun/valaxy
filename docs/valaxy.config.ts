import { defineValaxyConfig } from 'valaxy'
import type { PressTheme } from 'valaxy-theme-press'

const commitRef = process.env.COMMIT_REF?.slice(0, 8) || 'dev'

const safelist = [
  'i-ri-home-line',
]

export default defineValaxyConfig<PressTheme.Config>({
  title: 'Valaxy',
  url: 'https://valaxy.site',
  description: 'Valaxy Site Docs',

  theme: 'press',
  themeConfig: {
    sidebar: ['Getting Started', 'Guide', 'built-ins', 'Third', 'Custom', 'Theme', 'Addon', 'Dev'],
    nav: [
      {
        text: 'FAQ',
        link: '/dev/faq',
      },
      {
        text: 'Guide',
        link: '/guide/getting-started',
      },
      {
        text: 'Addons',
        items: [
          {
            text: 'index',
            link: '/addons',
          },
          {
            text: 'use',
            link: '/addons/use',
          },
          {
            text: 'write',
            link: '/addons/write',
          },
        ],
      },
    ],

    footer: {
      message: `Released under the MIT License. (${commitRef})`,
      copyright:
        'Copyright © 2022-present <a href="https://github.com/YunYouJun" target="_blank">YunYouJun</a> & <a href="https://github.com/YunYouJun/valaxy/graphs/contributors" target="_blank">Valaxy Contributors</a>',
    },
  },

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
