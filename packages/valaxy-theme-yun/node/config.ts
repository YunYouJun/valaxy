import type { ThemeConfig, UserThemeConfig } from '../types'

/**
 * Default Config
 */
export const defaultThemeConfig: ThemeConfig = {
  type: 'nimbo',

  valaxyDarkOptions: {
    circleTransition: true,
  },

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
    // url: bgImg,
    // dark: 'https://cdn.yunyoujun.cn/img/bg/dark-stars-timing-0-blur-30px.png',
  },

  say: {
    // enable: false,
    enable: true,
    api: '',
    // api: 'https://el-bot-api.elpsy.cn/api/words/young',
    hitokoto: {
      enable: true,
      api: 'https://v1.hitokoto.cn',
    },
  },

  fireworks: {
    enable: true,
    colors: [],
  },

  notice: {
    enable: false,
    hideInPages: false,
    content: '',
  },

  nav: [
    { text: 'menu.posts', link: '/posts/', icon: 'i-ri-article-line' },
  ],
  pages: [],

  sidebar: null,
  footer: {
    cloud: {
      enable: true,
    },
    since: 2022,
    icon: {
      enable: true,
      name: 'i-ri-cloud-line',
      animated: true,
      color: 'var(--va-c-primary)',
      url: 'https://www.yunyoujun.cn/sponsors/',
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
      color: 'black',
      icon: 'i-ri-twitter-x-fill',
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

/**
 * valaxy-theme-yun
 * @see https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun
 * define theme config
 */
export function defineThemeConfig(config: UserThemeConfig) {
  return config
}
