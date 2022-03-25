import defu from 'defu'
import type { VitePluginConfig } from 'unocss/vite'
import Unocss from 'unocss/vite'

import {
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  // presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import type { ValaxyConfig } from 'valaxy/src/types'
import type { ResolvedValaxyOptions } from '../options'

export const createSafelist = (config: ValaxyConfig) => {
  const safeIcons: string[] = [
    'i-ri-archive-line',
    'i-ri-folder-2-line',
    'i-ri-price-tag-3-line',

    'i-ri-cloud-line',
  ]

  const safelist = 'animate-fade-in prose prose-sm m-auto text-left'.split(' ').concat([
    'rotate-y-180',
  ]).concat(safeIcons)
  // generate icon safelist
  if (config.social.length)
    config.social.forEach(item => safelist.push(item.icon))

  if (config.themeConfig.footer?.icon?.name)
    safelist.push(config.themeConfig.footer?.icon?.name)

  // sponsor icon
  if (config.sponsor.methods.length)
    config.sponsor.methods.forEach(item => safelist.push(item.icon))

  return safelist
}

export const createUnocssConfig = (options: ResolvedValaxyOptions) => {
  const unocssConfig: VitePluginConfig = {
    shortcuts: [
      ['yun-main', 'lt-md:pl-0'],
      ['btn', 'px-4 py-1 rounded inline-block bg-sky-600 text-white cursor-pointer hover:bg-sky-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
      ['icon-btn', 'inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-sky-600'],
      ['card', 'transition shadow hover:shadow-lg'],
    ],
    presets: [
      presetUno(),
      presetAttributify(),
      presetIcons({
        scale: 1.2,
        // warn: true,
      }),
      presetTypography(),
      // presetWebFonts({
      //   fonts: {
      //     sans: 'DM Sans',
      //     mono: 'DM Mono',
      //   },
      // }),
    ],
    rules: [
      ['font-serif', {
        'font-family': 'var(--yun-font-serif)',
      }],
      ['font-sans', {
        'font-family': 'var(--yun-font-sans)',
      }],
      ['font-mono', {
        'font-family': 'var(--yun-font-mono)',
      }],
    ],
    transformers: [
      transformerDirectives(),
      transformerVariantGroup(),
    ],
    safelist: createSafelist(options.config),
  }

  return defu(options.config.unocss, unocssConfig)
}

export const createUnocssPlugin = (options: ResolvedValaxyOptions) => {
  const config = createUnocssConfig(options)
  return Unocss(config)
}
