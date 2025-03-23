import type { ResolvedValaxyOptions, ValaxyEntryOptions } from '../options'

import type { UserValaxyNodeConfig, ValaxyNodeConfig } from '../types'
import process from 'node:process'
import { isFunction } from '@antfu/utils'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import { createDefu } from 'defu'
import { mergeConfig as mergeViteConfig } from 'vite'
import { countPerformanceTime } from '../utils/performance'
import { defaultSiteConfig } from './site'
import { loadConfigFromFile } from './utils'

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

  deploy: { },

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
      fullText: false,
    },
  },

  features: {
    katex: true,
  },

  vite: {
    build: {
      emptyOutDir: true,
      // cssCodeSplit: false,
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
    consola.success(`Resolve ${colors.cyan('userValaxyConfig')} from ${colors.dim(configFile)} ${colors.yellow(duration)}`)

  const theme = options.theme || userValaxyConfig?.theme || 'yun'

  return {
    config: userValaxyConfig,
    configFile,
    theme,
  }
}
