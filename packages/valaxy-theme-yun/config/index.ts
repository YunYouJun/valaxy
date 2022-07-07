import type { ThemeConfig, ThemeUserConfig } from '../types'

export const anonymousImage = 'https://cdn.jsdelivr.net/gh/YunYouJun/cdn/img/avatar/none.jpg'

/**
 * Default Config
 */
export const defaultThemeConfig: ThemeConfig = {
  outlineTitle: 'On this page',
  colors: {
    primary: '#0078E7',
  },
  banner: {
    enable: true,
    title: '云游君的小站',
  },

  bg_image: {
    enable: true,
    url: 'https://cdn.jsdelivr.net/gh/YunYouJun/cdn/img/bg/stars-timing-0-blur-30px.jpg',
    dark: 'https://cdn.jsdelivr.net/gh/YunYouJun/cdn/img/bg/galaxy.jpg',
  },

  say: {
    enable: true,
    api: 'https://el-bot-api.vercel.app/api/words/young',
    hitokoto: {
      enable: false,
      api: 'https://v1.hitokoto.cn',
    },
  },

  pages: [],

  sidebar: null,
  footer: {
    since: 2022,
    icon: {
      name: 'i-ri-cloud-line',
      animated: true,
      color: 'var(--va-c-primary)',
      url: 'https://sponsors.yunyoujun.cn',
      title: 'Sponsor YunYouJun',
    },

    powered: true,

    beian: {
      enable: false,
      icp: '',
    },
  },

  types: {
    'link': {
      color: 'var(--va-c-primary)',
      icon: 'i-ri-external-link-line',
    },
    'bilibili': {
      color: '#FF8EB3',
      icon: 'i-ri-bilibili-line',
    },
    'douban': {
      color: '#007722',
      icon: 'i-ri-douban-line',
    },
    'github': {
      color: 'var(--va-c-text)',
      icon: 'i-ri-github-line',
    },
    'netease-cloud-music': {
      color: '#C10D0C',
      icon: 'i-ri-netease-cloud-music-line',
    },
    'notion': {
      color: 'var(--va-c-text)',
      icon: 'i-simple-icons-notion',
    },
    'twitter': {
      color: '#1da1f2',
      icon: 'i-ri-twitter-line',
    },
    'wechat': {
      color: '#1AAD19',
      icon: 'i-ri-wechat-2-line',
    },
    'weibo': {
      color: '#E6162D',
      icon: 'i-ri-weibo-line',
    },
    'yuque': {
      color: '#25b864',
      icon: 'i-ant-design-yuque-outlined',
    },
    'zhihu': {
      color: '#0084FF',
      icon: 'i-ri-zhihu-line',
    },
  },

  menu: {
    custom: {
      title: 'button.about',
      icon: 'i-ri-clipboard-line',
      url: '/about',
    },
  },
}

export default defaultThemeConfig

/**
 * generateSafelist by config
 * @param themeConfig
 * @returns
 */
export function generateSafelist(themeConfig: ThemeUserConfig) {
  const safelist = []

  const types = themeConfig.types
  if (types) {
    for (const type in types)
      safelist.push(types[type]?.icon)
  }

  if (themeConfig.footer?.icon?.name)
    safelist.push(themeConfig.footer?.icon?.name)

  if (themeConfig.menu?.custom?.icon)
    safelist.push(themeConfig.menu?.custom?.icon)

  return safelist
}
