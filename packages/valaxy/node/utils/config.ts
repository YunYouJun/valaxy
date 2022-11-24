import { mergeConfig as mergeViteConfig, normalizePath } from 'vite'
import { createDefu } from 'defu'
import { isFunction } from '@antfu/utils'
import type { LoadConfigSource } from 'unconfig'
import { loadConfig } from 'unconfig'
import type { ResolvedValaxyOptions, ValaxyEntryOptions } from '../options'
import type { ValaxyAddonFn, ValaxyAddonResolver, ValaxyConfig, ValaxyConfigFn } from '../types'

export interface LoadConfigFromFilesOptions {
  cwd?: string
  rewrite?: LoadConfigSource['rewrite']
}
export async function loadConfigFromFiles<T>(
  files: string,
  options: LoadConfigFromFilesOptions = {},
) {
  return await loadConfig<T>({
    sources: { files, rewrite: options.rewrite },
    cwd: options.cwd || process.cwd(),
  })
}

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
  return loadConfigFromFiles<ValaxyConfig>('valaxy.config', {
    rewrite<F = ValaxyConfig | ValaxyConfigFn>(c: F) {
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
  const { config: userValaxyConfig, sources } = await resolveValaxyConfigFromRoot(options.userRoot || process.cwd())
  const configFile = normalizePath(sources[0] || '')

  const theme = options.theme || userValaxyConfig.theme || 'yun'

  return {
    config: userValaxyConfig,
    configFile,
    theme,
  }
}

export async function resolveAddonConfig(addons: ValaxyAddonResolver[], options?: ResolvedValaxyOptions) {
  let valaxyConfig: ValaxyConfig = {}
  for (const addon of addons) {
    const { config, sources } = await loadConfigFromFiles<ValaxyConfig>('index', {
      rewrite<F = ValaxyConfig | ValaxyAddonFn>(obj: F, _filepath: string) {
        return (typeof obj === 'function' ? obj(addon, options!) : obj)
      },
      cwd: addon.root,
    })
    if (!config)
      continue
    addon.configFile = normalizePath(sources[0] || '')
    valaxyConfig = mergeValaxyConfig(config, valaxyConfig)
  }
  return valaxyConfig
}
