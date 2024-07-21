import process from 'node:process'

import { createDefu } from 'defu'
import { mergeConfig as mergeViteConfig } from 'vite'
import { isFunction } from '@antfu/utils'
import { cyan, dim, yellow } from 'picocolors'
import consola from 'consola'
import type { UserValaxyNodeConfig, ValaxyNodeConfig } from '../types'
import type { ResolvedValaxyOptions, ValaxyEntryOptions } from '../options'
import { countPerformanceTime } from '../utils/performance'
import { loadConfigFromFile } from './utils'
import { defaultSiteConfig } from './site'

export const defaultValaxyConfig: ValaxyNodeConfig = {
  siteConfig: defaultSiteConfig,
  theme: 'yun',
  themeConfig: {
    pkg: {
      name: '',
      version: '',
    },
  },

  build: {
    ssgForPagination: false,
  },

  // markdown: {
  //   excerpt: '<!-- more -->',
  // },
  runtimeConfig: {
    addons: {},
    redirects: {
      useVueRouter: true,
      redirectRoutes: [],
    },
  },

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
export async function resolveValaxyConfigFromRoot(root: string, options?: ResolvedValaxyOptions) {
  const c = await loadConfigFromFile<ValaxyNodeConfig>('valaxy', {
    cwd: root,
    valaxyOptions: options,
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

  const endCount = countPerformanceTime()
  const { config: userValaxyConfig, configFile } = await resolveValaxyConfigFromRoot(configRoot)
  const duration = endCount()

  if (configFile && userValaxyConfig && Object.keys(userValaxyConfig).length !== 0)
    consola.success(`Resolve ${cyan('userValaxyConfig')} from ${dim(configFile)} ${yellow(duration)}`)

  const theme = options.theme || userValaxyConfig?.theme || 'yun'

  return {
    config: userValaxyConfig,
    configFile,
    theme,
  }
}
