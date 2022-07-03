import { resolve } from 'path'
import { existsSync } from 'fs'
import type { VitePluginConfig as UnoCSSConfig, VitePluginConfig } from 'unocss/vite'
import Unocss from 'unocss/vite'
import jiti from 'jiti'
import defu from 'defu'

import {
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import type { ValaxyConfig } from 'valaxy'
import type { ThemeUserConfig } from 'valaxy-theme-yun'
import { uniq } from '@antfu/utils'
import type { ResolvedValaxyOptions, ValaxyPluginOptions } from '../options'
import { loadSetups } from './setupNode'

export const createSafelist = async (config: ValaxyConfig<ThemeUserConfig>) => {
  const { generateSafelist } = await import(`valaxy-theme-${config.theme}`)

  const safeIcons: string[] = [
    'i-ri-archive-line',
    'i-ri-folder-2-line',
    'i-ri-price-tag-3-line',

    'i-ri-cloud-line',
  ]

  let themeSafelist: string[] = []
  if (typeof generateSafelist === 'function')
    themeSafelist = generateSafelist(config.themeConfig)

  const safelist = 'animate-fade-in m-auto text-left'.split(' ').concat([
    'rotate-y-180',
  ]).concat(safeIcons).concat(themeSafelist)

  // generate icon safelist
  if (config.social.length)
    config.social.forEach(item => safelist.push(item.icon))

  // sponsor icon
  if (config.sponsor.methods.length)
    config.sponsor.methods.forEach(item => safelist.push(item.icon))

  return safelist
}

export const createUnocssConfig = async (options: ResolvedValaxyOptions) => {
  const unocssConfig: VitePluginConfig = {
    shortcuts: [
      ['yun-main', 'lt-md:pl-0'],
      ['yun-card', 'transition yun-transition shadow hover:shadow-lg'],
      ['btn', 'px-4 py-1 rounded inline-block bg-sky-600 text-white cursor-pointer hover:bg-sky-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
      ['icon-btn', 'inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-sky-600'],
      ['va-card', 'shadow hover:shadow-lg'],
    ],
    presets: [
      presetUno(),
      presetAttributify(),
      presetIcons({
        scale: 1.2,
        // warn: true,
      }),
      presetTypography(),
      // web fonts is so big, so we disable it, let the user decide
      // presetWebFonts({
      //   fonts: {
      //     serif: [
      //       {
      //         name: 'Noto Serif SC',
      //         weights: [900],
      //       },
      //     ],
      //   },
      // }),
    ],
    rules: [
      // more see '~/styles/global/helper.scss'
      ['yun-transition', {
        'transition-duration': 'var(--va-transition-duration)',
      }],
      ['yun-text-light', {
        color: 'var(--va-c-text-light)',
      }],
      ['font-serif', {
        'font-family': 'var(--va-font-serif)',
      }],
      ['font-sans', {
        'font-family': 'var(--va-font-sans)',
      }],
      ['font-mono', {
        'font-family': 'var(--va-font-mono)',
      }],
    ],
    transformers: [
      transformerDirectives(),
      transformerVariantGroup(),
    ],
    safelist: await createSafelist(options.config),
  }

  return unocssConfig
}

export const createUnocssPlugin = async (options: ResolvedValaxyOptions, { unocss: unoOptions }: ValaxyPluginOptions) => {
  const defaultConfig = await createUnocssConfig(options)

  const { themeRoot, clientRoot, roots } = options

  const configFiles = uniq([
    resolve(themeRoot, 'uno.config.ts'),
    resolve(clientRoot, 'uno.config.ts'),
  ])

  const configFile = configFiles.find(i => existsSync(i))

  let config: UnoCSSConfig | { default: UnoCSSConfig } = {}

  if (configFile) {
    config = jiti(__filename)(configFile) as UnoCSSConfig | { default: UnoCSSConfig }
    if ('default' in config)
      config = config.default
  }

  config = await loadSetups(roots, 'unocss.ts', {}, config, true)

  const unocssConfig = defu(defaultConfig, config)

  return Unocss({
    configFile: false,
    ...defu(unocssConfig, unoOptions || {}) as UnoCSSConfig,
  })
}
