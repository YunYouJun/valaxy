import type { ThemeConfig } from '../types'
import noneImg from '../assets/images/none.jpg'

export const anonymousImage = noneImg

/**
 * Default Config
 */
export const defaultThemeConfig: ThemeConfig = {
  logo: '',
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

  socialLinks: [

  ],

  footer: {},
}
