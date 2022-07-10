import type { ResolvedValaxyOptions, ValaxyThemeOptions } from 'valaxy/node'
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
        valaxy: {},
      }
    },
  }
}

// TODO: Whether to provide defineConfig function definition
function themeYun(options: ResolvedValaxyOptions): ValaxyThemeOptions {
  return {
    vite: {
      plugins: [ThemeYunVitePlugin(options)],
    },
    markdown: {
      config(md) {
        console.log('-----')
      },
    },
  }
}

export default themeYun
