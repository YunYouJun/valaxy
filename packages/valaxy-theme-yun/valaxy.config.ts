import type { ResolvedValaxyOptions } from 'valaxy'
import { defineValaxyTheme } from 'valaxy'
import type { Plugin } from 'vite'
import type { ThemeConfig } from './types'
import { defaultThemeConfig, generateSafelist } from './node'

function ThemeVitePlugin(options: ResolvedValaxyOptions<ThemeConfig>): Plugin {
  const themeConfig = options.config.themeConfig || {}
  return {
    name: 'valaxy-theme-yun',
    enforce: 'pre',
    config() {
      return {
        css: {
          preprocessorOptions: {
            scss: {
              additionalData: `$c-primary: ${themeConfig.colors?.primary || '#0078E7'} !default;`,
            },
          },
        },

        optimizeDeps: {
          exclude: ['@docsearch/js'],
        },
      }
    },
  }
}

export default defineValaxyTheme<ThemeConfig>((options) => {
  return {
    themeConfig: defaultThemeConfig,
    vite: {
      plugins: [ThemeVitePlugin(options)],
    },
    unocss: {
      safelist: generateSafelist(options),
    },
  }
})
