import process from 'node:process'

import { createDefu } from 'defu'
import { mergeConfig as mergeViteConfig } from 'vite'
import { isFunction } from '@antfu/utils'
import { cyan, dim } from 'kolorist'
import consola from 'consola'
import type { UserValaxyNodeConfig, ValaxyNodeConfig } from '../types'
import type { ResolvedValaxyOptions, ValaxyEntryOptions } from '../options'
import { loadConfigFromFile } from './utils'
import { defaultSiteConfig } from './site'

export const defaultValaxyConfig: ValaxyNodeConfig = {
  ignoreDeadLinks: true,

  siteConfig: defaultSiteConfig,
  theme: 'yun',
  themeConfig: {
    pkg: {
      name: '',
      version: '',
    },
  },

  // markdown: {
  //   excerpt: '<!-- more -->',
  // },
  runtimeConfig: { addons: {} },

  modules: {
    rss: {
      enable: true,
    },
  },

  features: {
    katex: true,
  },

  vite: {
    build: {
      rollupOptions: {
        external: [],
      },
    },
  },

  devtools: true,
}

/**
 * Type helper for valaxy.config.ts
 */
export function defineValaxyConfig<ThemeConfig>(config: UserValaxyNodeConfig<ThemeConfig>) {
  return config
}
export const defineConfig = defineValaxyConfig

/*
 * resolve valaxy config from special root
 */
export async function resolveValaxyConfigFromRoot(root: string, _options?: ResolvedValaxyOptions) {
  const c = await loadConfigFromFile<ValaxyNodeConfig>('valaxy', {
    // rewrite<F = ValaxyNodeConfig | ValaxyConfigFn>(c: F) {
    //   return (typeof c === 'function' ? c(options || {} as ResolvedValaxyOptions) : c)
    // },
    cwd: root,
  })
  return c
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
 * resolve user valaxy config
 * options only have userRoot
 * @param options
 */
export async function resolveValaxyConfig(options: ValaxyEntryOptions) {
  const configRoot = options.userRoot || process.cwd()

  const { config: userValaxyConfig, configFile } = await resolveValaxyConfigFromRoot(configRoot)

  if (userValaxyConfig && configFile)
    consola.success(`Resolve ${cyan('userValaxyConfig')} from ${dim(configFile)}`)

  const theme = options.theme || userValaxyConfig?.theme || 'yun'

  return {
    config: userValaxyConfig,
    configFile,
    theme,
  }
}
