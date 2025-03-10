import type { DefaultTheme } from 'valaxy/types'
import type { ResolvedValaxyOptions } from '../options'
import type { ValaxyNodeConfig } from '../types'
import { colors } from 'consola/utils' // updated import
import defu from 'defu'
import { logger } from '../logger'
import { loadConfigFromFile } from './utils'

/**
 * resolve theme config from special root
 */
export async function resolveThemeConfigFromRoot(root: string) {
  return loadConfigFromFile<DefaultTheme.Config>('theme', {
    cwd: root,
  })
}

/**
 * resolve theme.config.ts and merge with default
 */
export async function resolveUserThemeConfig(options: ResolvedValaxyOptions) {
  let { config: userThemeConfig, configFile: themeConfigFile } = await resolveThemeConfigFromRoot(options.userRoot)

  if (userThemeConfig && themeConfigFile)
    logger.info(`Resolve ${colors.cyan('themeConfig')} from ${colors.dim(themeConfigFile)}`) // updated code

  if (options?.themeRoot) {
    // todo mount defaultThemeConfig
    const { config: defaultThemeConfig } = await resolveThemeConfigFromRoot(options.themeRoot)
    userThemeConfig = defu(userThemeConfig || {}, defaultThemeConfig)
  }

  return {
    themeConfig: userThemeConfig,
    themeConfigFile,
  }
}

export type ValaxyConfigExtendKey = 'vite' | 'vue' | 'unocss' | 'unocssPresets' | 'markdown' | 'extendMd' | 'addons'
export type ValaxyPickConfig = Pick<ValaxyNodeConfig, ValaxyConfigExtendKey>
export type ValaxyTheme<ThemeConfig = DefaultTheme.Config> = ValaxyPickConfig & { themeConfig?: ThemeConfig }

export function defineValaxyTheme<ThemeConfig = DefaultTheme.Config>(
  theme: ValaxyTheme<ThemeConfig> | ((options: ResolvedValaxyOptions<ThemeConfig>) => ValaxyTheme<ThemeConfig>),
) {
  return theme
}

export const defineTheme = defineValaxyTheme
