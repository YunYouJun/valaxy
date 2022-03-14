/**
 * Theme Config
 */
export interface ThemeConfig {
  banner: {
    enable: boolean
    title: string
  }

  bg_image: {
    enable: boolean
    url: string
    dark?: string
    opacity: number
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
}
