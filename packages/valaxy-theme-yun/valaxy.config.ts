import type { ResolvedValaxyOptions } from 'valaxy'
import { defineConfig } from 'valaxy/node'
import type { Plugin } from 'vite'
import type { ThemeConfig } from './types'
import { generateSafelist } from './node'

function ThemeVitePlugin(options: ResolvedValaxyOptions<ThemeConfig>): Plugin {
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

const config = defineConfig<ThemeConfig>((options) => {
  return {
    vite: {
      plugins: [ThemeVitePlugin(options)],
    },
    unocss: {
      safelist: generateSafelist(options.config.themeConfig),
    },
  }
})

export default config
