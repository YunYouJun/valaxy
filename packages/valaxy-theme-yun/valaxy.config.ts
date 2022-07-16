import type { ResolvedValaxyOptions } from 'valaxy'
import { defineConfig } from 'valaxy/node'
import type { Plugin } from 'vite'

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

const config = defineConfig((options) => {
  return {
    vite: {
      plugins: [ThemeYunVitePlugin(options)],
    },
  }
})

export default config
