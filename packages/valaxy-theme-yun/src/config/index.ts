/**
 * Theme Config
 */
export interface ThemeConfig {
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
    opacity: number
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
}

export type ThemeUserConfig = Partial<ThemeConfig>

/**
 * Default Config
 */
export const defaultThemeConfig: ThemeConfig = {
  banner: {
    enable: true,
    title: '云游君的小站',
  },

  bg_image: {
    enable: true,
    url: 'https://cdn.jsdelivr.net/gh/YunYouJun/cdn/img/bg/stars-timing-0-blur-30px.jpg',
    dark: 'https://cdn.jsdelivr.net/gh/YunYouJun/cdn/img/bg/galaxy.jpg',
    opacity: 1,
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
      color: 'var(--yun-c-primary)',
      url: 'https://sponsors.yunyoujun.cn',
      title: '',
    },

    powered: true,

    beian: {
      enable: false,
      icp: '',
    },
  },
}

export default defaultThemeConfig
