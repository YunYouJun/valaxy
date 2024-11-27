import type { ResolvedValaxyOptions } from 'valaxy'
import type { Plugin } from 'vite'
import type { ThemeConfig } from './types'
import { defineTheme } from 'valaxy'
import { defaultThemeConfig, generateSafelist } from './index'

function ThemeVitePlugin(options: ResolvedValaxyOptions<ThemeConfig>): Plugin {
  const themeConfig = options?.config.themeConfig || {}
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
          include: [
            '@ctrl/tinycolor',
            'gsap',
            'gsap/dist/ScrollToPlugin',
            '@explosions/fireworks',

            '@vueuse/motion',
            'primevue/toastservice',
            'primevue/config',
          ],
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
      plugins: [ThemeVitePlugin(options)],
    },
    unocss: {
      safelist: generateSafelist(options),
    },
  }
})
