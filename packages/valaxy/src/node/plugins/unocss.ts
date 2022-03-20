import defu from 'defu'
import type { VitePluginConfig } from 'unocss/vite'
import Unocss from 'unocss/vite'

import {
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import type { ValaxyConfig } from 'valaxy/src/types'
import type { ResolvedValaxyOptions } from '../options'

export const createSafelist = (config: ValaxyConfig) => {
  const safelist = 'prose prose-sm m-auto text-left'.split(' ')
  // generate icon safelist
  if (config.social.length)
    config.social.forEach(item => safelist.push(item.icon))

  return safelist
}

export const createUnocssConfig = (options: ResolvedValaxyOptions) => {
  const unocssConfig: VitePluginConfig = {
    shortcuts: [
      ['btn', 'px-4 py-1 rounded inline-block bg-sky-600 text-white cursor-pointer hover:bg-sky-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
      ['icon-btn', 'inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-sky-600'],
    ],
    presets: [
      presetUno(),
      presetAttributify(),
      presetIcons({
        scale: 1.2,
        warn: true,
      }),
      presetTypography(),
      presetWebFonts({
        fonts: {
          sans: 'DM Sans',
          serif: 'DM Serif Display',
          mono: 'DM Mono',
        },
      }),
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
