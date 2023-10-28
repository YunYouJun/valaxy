import type { UserSiteConfig } from 'valaxy'
import { cyan, dim } from 'kolorist'
import consola from 'consola'
import { loadConfigFromFile } from './utils'

/**
 * resolve valaxy config from special root
 */
export async function resolveSiteConfigFromRoot(root: string) {
  return loadConfigFromFile<UserSiteConfig>('site.config', {
    cwd: root,
  })
}

/**
 * resolve site.config.ts and merge with default
 * @param root
 */
export async function resolveSiteConfig(root: string) {
  const { config: userSiteConfig, configFile: siteConfigFile } = await resolveSiteConfigFromRoot(root)
  if (userSiteConfig)
    consola.success(`Resolve ${cyan('siteConfig')} from ${dim(siteConfigFile)}`)

  return {
    siteConfig: userSiteConfig,
    siteConfigFile,
  }
}
