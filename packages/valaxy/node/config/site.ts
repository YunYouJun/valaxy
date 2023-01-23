import type { UserSiteConfig } from 'valaxy'
import { cyan } from 'kolorist'
import { defu } from 'defu'
import { defaultSiteConfig } from '..'
import { logger } from '../logger'
import { loadConfigFromFile } from './utils'

/**
 * resolve valaxy config from special root
 * @param options
 * @returns
 */
export async function resolveSiteConfigFromRoot(root: string) {
  logger.info(`Resolve ${cyan('site.config.ts')}`)
  return loadConfigFromFile<UserSiteConfig>('site.config', {
    cwd: root,
  })
}

/**
 * resolve site.config.ts and merge with default
 * @param root
 * @returns
 */
export async function resolveSiteConfig(root: string) {
  const { config: userSiteConfig, configFile: siteConfigFile } = await resolveSiteConfigFromRoot(root)

  return {
    siteConfig: defu(userSiteConfig, defaultSiteConfig),
    siteConfigFile,
  }
}
