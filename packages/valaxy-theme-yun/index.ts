import type { Plugin } from 'vite'
import type { ThemeConfig } from './config'
import { defaultThemeConfig } from './config'

export * from './config'

export interface UserOptions {
  colors: {
    primary: string
  }
}

export function yunPlugin(userOptions: Partial<ThemeConfig> = defaultThemeConfig): Plugin {
  return {
    name: 'valaxy-theme-yun',
    enforce: 'pre',

    config() {
      return {
        css: {
          preprocessorOptions: {
            scss: {
              additionalData: `$yun-c-primary: ${userOptions.colors?.primary || '#0078E7'} !default;`,
            },
          },
        },
      }
    },
  }
}

export default yunPlugin
