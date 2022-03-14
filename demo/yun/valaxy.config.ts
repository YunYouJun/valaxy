import type { UserConfig } from 'valaxy'
import type { ThemeUserConfig } from 'valaxy-theme-yun'

/**
 * User Config
 */
export const config: UserConfig<ThemeUserConfig> = {
  themeConfig: {
    banner: {
      enable: true,
      title: '云游君的小站',
    },
  },
}

export default config
