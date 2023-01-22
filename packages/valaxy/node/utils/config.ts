import { mergeConfig as mergeViteConfig } from 'vite'
import { createDefu } from 'defu'
import { isFunction } from '@antfu/utils'

import consola from 'consola'
import { cyan } from 'kolorist'
import type { ResolvedValaxyOptions, ValaxyEntryOptions } from '../options'
import type { ValaxyAddonFn, ValaxyAddonResolver, ValaxyConfigFn, ValaxyNodeConfig } from '../types'
import { loadConfigFromFile } from '../config/utils'

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
  consola.info(`Resolve ${cyan('valaxy.config.ts')}`)

  // const resolved = await mergeValaxyConfig(options)
  // valaxyConfig = mergeValaxyConfig(valaxyConfig, config)
  const { config: userValaxyConfig, configFile } = await resolveValaxyConfigFromRoot(options.userRoot || process.cwd())

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
    const { config, configFile } = await loadConfigFromFile<ValaxyNodeConfig>('index', {
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
