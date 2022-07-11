import { defineThemePlugin } from 'valaxy'
import type { ResolvedValaxyOptions } from 'valaxy'
import type { Plugin } from 'vite'

export * from '../config'
export * from '../types'

export interface UserOptions {
  colors: {
    primary: string
  }
}

function ThemeYunVitePlugin(options: ResolvedValaxyOptions): Plugin {
  const themeConfig = options.config.themeConfig
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

export default defineThemePlugin((options) => {
  return {
    vite: {
      plugins: [ThemeYunVitePlugin(options)],
    },
  }
})
