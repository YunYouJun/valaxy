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

  sidebar: [],
  nav: [],

  editLink: {
    pattern: 'https://github.com/YunYouJun/valaxy/edit/main/docs/:path',
    text: 'Edit this page on GitHub',
  },

  footer: {},
}
