import { mergeConfig as mergeViteConfig, normalizePath } from 'vite'
import { loadConfig } from 'unconfig'
import { createDefu } from 'defu'
import { isFunction } from '@antfu/utils'
import type { ResolvedValaxyOptions, ValaxyEntryOptions } from '../options'
import type { ValaxyConfig, ValaxyConfigFn } from '../types'

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
  // c12 merge array twice, so i deprecated it
  const { config, sources } = await loadConfig<ValaxyConfig>({
    sources: {
      files: 'valaxy.config',
      async rewrite(c: ValaxyConfig | ValaxyConfigFn) {
        const config = await (typeof c === 'function' ? c(options || {} as ResolvedValaxyOptions) : c)
        return config
      },
    },
    cwd: root,
  })

  if (!config.vite)
    config.vite = {}

  return {
    config,
    sources,
  }
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
