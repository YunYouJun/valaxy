import type { ThemeConfig } from '../types'

export const anonymousImage = 'https://cdn.yunyoujun.cn/img/avatar/none.jpg'

/**
 * Default Config
 */
export const defaultThemeConfig: ThemeConfig = {
  outlineTitle: 'On this page',

  colors: {
    primary: '#0078E7',
  },

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
}

export default defaultThemeConfig
