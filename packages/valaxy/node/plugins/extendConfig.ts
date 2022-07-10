import { resolve } from 'path'
import type { InlineConfig, Plugin } from 'vite'
import { mergeConfig } from 'vite'
import type { ResolvedValaxyOptions } from '../options'
import { toAtFS } from '../utils'

export function createConfigPlugin(options: ResolvedValaxyOptions): Plugin {
  return {
    name: 'valaxy:config',

    config(config) {
      const injection: InlineConfig = {
        resolve: {
          alias: {
            '~/': `${toAtFS(options.userRoot)}/`,
            'valaxy/client/': `${toAtFS(options.clientRoot)}/`,
            'valaxy/package.json': toAtFS(resolve(options.clientRoot, '../package.json')),
            'valaxy': toAtFS(resolve(options.clientRoot, 'index.ts')),
            '@valaxyjs/client/': `${toAtFS(options.clientRoot)}/`,
            [`valaxy-theme-${options.theme}/`]: `${toAtFS(resolve(options.themeRoot))}/`,
            [`valaxy-theme-${options.theme}`]: `${toAtFS(resolve(options.themeRoot))}/client/index.ts`,
          },
        },

        optimizeDeps: {
          // do not entry node file
          entries: [resolve(options.clientRoot, 'main.ts')],

          // must need it
          include: [
            'vue',
            'vue-router',
            '@vueuse/core',
            '@vueuse/head',
            'dayjs',
            'nprogress',
          ],
        },
      }
      return mergeConfig(config, injection)
    },
  }
}
