import type { Plugin } from 'vite'
import type { ResolvedValaxyOptions } from 'valaxy'

export * from '../config'
export * from '../types'

export interface UserOptions {
  colors: {
    primary: string
  }
}

export function themePlugin(options: ResolvedValaxyOptions): Plugin {
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

        valaxy: {},
      }
    },
  }
}

export default themePlugin
