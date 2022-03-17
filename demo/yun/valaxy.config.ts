import type { UserConfig } from 'valaxy'
import type { ThemeUserConfig } from 'valaxy-theme-yun'

/**
 * User Config
 * do not use export const
 */
const config: UserConfig<ThemeUserConfig> = {
  title: 'Valaxy Theme Yun',
  author: '云游君',
  description: 'Valaxy Theme Yun Preview.',

  theme: 'yun',

  themeConfig: {
    banner: {
      enable: true,
      title: '云游君的小站',
      // title: '测试',
    },
  },
}

export default config
