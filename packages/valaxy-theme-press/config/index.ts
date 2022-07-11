import type { ThemeConfig, ThemeUserConfig } from '../types'

export const anonymousImage = 'https://cdn.yunyoujun.cn/img/avatar/none.jpg'

/**
 * Default Config
 */
export const defaultThemeConfig: ThemeConfig = {
  outlineTitle: 'On this page',

  colors: {
    primary: '#0078E7',
  },

  nav: [],
}

export default defaultThemeConfig

/**
 * generateSafelist by config
 * @param themeConfig
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateSafelist(themeConfig: ThemeUserConfig) {
  const safelist: string[] = []
  return safelist
}
