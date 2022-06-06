export const anonymousImage = 'https://cdn.jsdelivr.net/gh/YunYouJun/cdn/img/avatar/none.jpg'

/**
 * Theme Config
 */
export interface ThemeConfig {
  // for unocss
  safelist: string[]
  colors: {
    /**
     * primary color
     * @default '#0078E7'
     */
    primary: string
  }

  /**
   * 首页标语
   */
  banner: {
    enable: boolean
    /**
     * 标题
     */
    title: string
  }

  bg_image: {
    enable: boolean
    url: string
    dark?: string
    opacity?: number
  }

  /**
   * say something
   * https://say.elpsy.cn
   */
  say: {
    enable: boolean
    api: string
    hitokoto: {
      enable: boolean
      api: string
    }
  }

  pages: {
    name: string
    url: string
    icon: string
    color: string
  }[]

  /**
   * footer
   */
  footer: {
    /**
     * 建站于
     */
    since: number

    /**
     * Icon between year and copyright info.
     */
    icon: {
      /**
       * icon name, i-xxx
       */
      name: string
      animated: boolean
      color: string
      url: string
      title: string
    }

    /**
     * Powered by valaxy & valaxy-theme-${name}, default is yun
     */
    powered: boolean

    /**
     * Chinese Users | 中国用户
     * 备案 ICP
     * 国内用户需要在网站页脚展示备案 ICP 号
     * https://beian.miit.gov.cn/
     */
    beian: {
      enable: boolean
      /**
       * 苏ICP备xxxxxxxx号
       */
      icp: string
    }
  }

  /**
   * post card types
   */
  types: Record<string, {
    color: string
    icon: string
  }>

  /**
   * 菜单栏
   */
  menu: {
    custom: {
      title: string
      url: string
      icon: string
    }
  }
}

export type ThemeUserConfig = Partial<ThemeConfig>

/**
 * Default Config
 */
export const defaultThemeConfig: ThemeConfig = {
  safelist: ['i-ri-clipboard-line'],
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

defaultThemeConfig.safelist = defaultThemeConfig.safelist.concat(generateSafelist(defaultThemeConfig))

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
      safelist.push(types[type].icon)
  }

  if (themeConfig.footer?.icon?.name)
    safelist.push(themeConfig.footer?.icon?.name)

  if (themeConfig.menu?.custom?.icon)
    safelist.push(themeConfig.menu?.custom?.icon)

  return safelist
}
