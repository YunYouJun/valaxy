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
}

export default defaultThemeConfig
