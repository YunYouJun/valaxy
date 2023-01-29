import type { UserSiteConfig } from 'valaxy'
import { cyan, dim } from 'kolorist'
import { logger } from '../logger'
import { loadConfigFromFile } from './utils'

/**
 * resolve theme config from special root
 * @param options
 * @returns
 */
export async function resolveThemeConfigFromRoot(root: string) {
  return loadConfigFromFile<UserSiteConfig>('theme.config', {
    cwd: root,
  })
}

/**
 * resolve theme.config.ts and merge with default
 * @param root
 * @returns
 */
export async function resolveThemeConfig(root: string) {
  const { config: userThemeConfig, configFile: themeConfigFile } = await resolveThemeConfigFromRoot(root)

  if (userThemeConfig)
    logger.info(`Resolve ${cyan('themeConfig')} from ${dim(themeConfigFile)}`)

  return {
    themeConfig: userThemeConfig,
    themeConfigFile,
  }
}
