import type { Plugin } from 'vite'
import type { ThemeConfig } from '../types'
import { defaultThemeConfig } from '../config'

export * from '../config'
export * from '../types'

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
              additionalData: `$c-primary: ${userOptions.colors?.primary || '#0078E7'} !default;`,
            },
          },
        },
      }
    },
  }
}

export default yunPlugin
