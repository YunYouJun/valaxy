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
import type { ResolvedValaxyOptions, ValaxyConfig } from '../options'
import { loadSetups } from './setupNode'

export const createSafelist = async (options: ResolvedValaxyOptions, pluginOptions: ValaxyConfig = {}) => {
  const { config } = options
  const safeIcons: string[] = [
    'i-ri-clipboard-line',

    'i-ri-archive-line',
    'i-ri-folder-2-line',
    'i-ri-price-tag-3-line',

    'i-ri-cloud-line',
  ].concat(pluginOptions.unocss?.safelist || [])

  const safelist = 'animate-fade-in m-auto text-left'.split(' ').concat([
    'rotate-y-180',
  ]).concat(safeIcons)

  // generate icon safelist
  if (config.social.length)
    config.social.forEach(item => safelist.push(item.icon))

  // sponsor icon
  if (config.sponsor.methods.length)
    config.sponsor.methods.forEach(item => safelist.push(item.icon))

  let themeSafelist: string[] = []
  const generateSafelist = options.themeSetup.generateSafelist
  if (typeof generateSafelist === 'function')
    themeSafelist = generateSafelist(options.config.themeConfig)

  return safelist.concat(themeSafelist)
}

export const createUnocssConfig = async (options: ResolvedValaxyOptions, pluginOptions: ValaxyConfig) => {
  const unocssConfig: VitePluginConfig = {
    shortcuts: [
      ['btn', 'px-4 py-1 rounded inline-block bg-sky-600 text-white cursor-pointer hover:bg-sky-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
      ['icon-btn', 'inline-flex justify-center items-center cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-sky-600'],
      ['va-card', 'shadow hover:shadow-lg'],
    ],
    presets: [
      presetUno(pluginOptions.unocssPresets?.uno),
      presetAttributify(pluginOptions.unocssPresets?.attributify),
      presetIcons({
        scale: 1.2,
        // warn: true,
        ...pluginOptions.unocssPresets?.icons,
      }),
      presetTypography(pluginOptions.unocssPresets?.typography),
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
      // more see 'valaxy/client/styles/global/helper.scss'
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
    safelist: await createSafelist(options),
  }

  return unocssConfig
}

export const createUnocssPlugin = async (options: ResolvedValaxyOptions, pluginOptions: ValaxyConfig) => {
  const { unocss: unoOptions } = pluginOptions
  const defaultConfig = await createUnocssConfig(options, pluginOptions)

  const { themeRoot, clientRoot, roots } = options

  const unoConfigFiles = ['uno.config.ts', 'unocss.config.ts']
  const configFiles: string[] = []
  const dirs = [themeRoot, clientRoot]
  dirs.forEach(dir =>
    unoConfigFiles.forEach(file =>
      configFiles.push(resolve(dir, file)),
    ),
  )

  let config: UnoCSSConfig | { default: UnoCSSConfig } = {}

  const configDeps: string[] = []

  configFiles.forEach((configFile) => {
    if (existsSync(configFile)) {
      let uConfig: UnoCSSConfig | { default: UnoCSSConfig } = jiti(__filename)(configFile) as UnoCSSConfig | { default: UnoCSSConfig }
      if ('default' in uConfig)
        uConfig = uConfig.default

      config = defu(config, uConfig)

      configDeps.push(configFile)
    }
  })

  config = await loadSetups(roots, 'unocss.ts', {}, config, true)

  // https://github.com/unocss/unocss/issues/1262
  return Unocss({
    configDeps,
    configFile: false,
    ...defu(unoOptions || {}, config, defaultConfig),
  })
}
