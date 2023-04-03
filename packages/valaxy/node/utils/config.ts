import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { mergeConfig as mergeViteConfig } from 'vite'
import { createDefu } from 'defu'
import { isFunction } from '@antfu/utils'

import { cyan, dim } from 'kolorist'
import type { ResolvedValaxyOptions, ValaxyEntryOptions } from '../options'
import type { ValaxyAddonFn, ValaxyAddonResolver, ValaxyConfigFn, ValaxyNodeConfig } from '../types'
import { loadConfigFromFile } from '../config/utils'
import { logger } from '../logger'

/**
 * merge valaxy.config
 * (source, default)
 */
export const mergeValaxyConfig = createDefu((obj: any, key, value) => {
  if (isFunction(obj[key]) && isFunction(value)) {
    obj[key] = function (...args: any[]) {
      obj[key].call(this, ...args)
      value.call(this, ...args)
    }
  }
  if (key === 'vite') {
    // a deep copy and needs to be taken over
    obj[key] = mergeViteConfig(obj[key], value)
    return true
  }
})

/**
 * resolve valaxy config from special root
 * @param options
 * @returns
 */
export async function resolveValaxyConfigFromRoot(root: string, options?: ResolvedValaxyOptions) {
  return loadConfigFromFile<ValaxyNodeConfig>('valaxy.config', {
    rewrite<F = ValaxyNodeConfig | ValaxyConfigFn>(c: F) {
      return (typeof c === 'function' ? c(options || {} as ResolvedValaxyOptions) : c)
    },
    cwd: root,
  })
}

/**
 * resolve user valaxy config
 * options only have userRoot
 * @param options
 * @param viteConfig
 * @returns
 */
export async function resolveValaxyConfig(options: ValaxyEntryOptions) {
  // const resolved = await mergeValaxyConfig(options)
  // valaxyConfig = mergeValaxyConfig(valaxyConfig, config)
  const { config: userValaxyConfig, configFile } = await resolveValaxyConfigFromRoot(options.userRoot || process.cwd())
  if (userValaxyConfig)
    logger.info(`Resolve ${cyan('valaxyConfig')} from ${dim(configFile)}`)

  const theme = options.theme || userValaxyConfig.theme || 'yun'

  return {
    config: userValaxyConfig,
    configFile,
    theme,
  }
}

export async function resolveAddonConfig(addons: ValaxyAddonResolver[], options?: ResolvedValaxyOptions) {
  let valaxyConfig: ValaxyNodeConfig = {} as ValaxyNodeConfig
  for (const addon of addons) {
    // unconfig get node_modules/valaxy-addon-xxx/valaxy.config.ts(not exist) but get userRoot/valaxy.config.ts
    // so we need to check if valaxy.config.ts exist
    if (!existsSync(resolve(addon.root, 'valaxy.config.ts')))
      continue

    const { config, configFile } = await loadConfigFromFile('valaxy.config', {
      rewrite<F = ValaxyNodeConfig | ValaxyAddonFn>(obj: F, _filepath: string) {
        return (typeof obj === 'function' ? obj(addon, options!) : obj)
      },
      cwd: addon.root,
    })

    if (!config)
      continue

    addon.configFile = configFile
    valaxyConfig = mergeValaxyConfig(config, valaxyConfig)
  }
  return valaxyConfig
}
