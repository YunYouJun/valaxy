import type { UserSiteConfig } from 'valaxy'
import { cyan, dim } from 'kolorist'
import ora from 'ora'
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
  const spinner = ora(`Resolve ${cyan('siteConfig')} from ${dim(root)}`).start()
  const { config: userSiteConfig, configFile: siteConfigFile } = await resolveSiteConfigFromRoot(root)
  if (userSiteConfig)
    spinner.succeed(`Resolve ${cyan('siteConfig')} from ${dim(siteConfigFile)}`)

  return {
    siteConfig: userSiteConfig,
    siteConfigFile,
  }
}
