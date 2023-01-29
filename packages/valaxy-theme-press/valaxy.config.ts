import type { ResolvedValaxyOptions } from 'valaxy'
import { defineTheme } from 'valaxy'
import type { Plugin } from 'vite'
import { defaultThemeConfig } from './config'
import type { ThemeConfig } from './types'

function ThemeVitePlugin(options: ResolvedValaxyOptions<ThemeConfig>): Plugin {
  const themeConfig = options.config.themeConfig!

  return {
    name: 'valaxy-theme-press',
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

export default defineTheme<ThemeConfig>((options) => {
  return {
    themeConfig: defaultThemeConfig,
    vite: {
      build: {
        rollupOptions: {
          external: ['valaxy-addon-algolia'],
        },
      },
      plugins: [ThemeVitePlugin(options)],
    },
  }
})
