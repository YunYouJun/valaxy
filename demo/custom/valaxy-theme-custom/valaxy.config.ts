import type { ThemeConfig } from './types'
import { defineTheme } from 'valaxy'
import { defaultThemeConfig, generateSafelist, themePlugin } from './node'

export default defineTheme<ThemeConfig>((options) => {
  return {
    themeConfig: defaultThemeConfig,
    vite: {
      plugins: [themePlugin(options)],
    },
    unocss: {
      safelist: generateSafelist(options.config.themeConfig as ThemeConfig),
    },
  }
})
