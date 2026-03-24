import type { ResolvedValaxyOptions, UserValaxyNodeConfig, ValaxyEntryOptions, ValaxyNodeConfig } from '../types'

import process from 'node:process'
import { isFunction } from '@antfu/utils'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import { createDefu } from 'defu'
import { mergeConfig as mergeViteConfig } from 'vite'
import { countPerformanceTime } from '../utils/performance'
import { replaceArrMerge } from './merge'
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
    ssg: {
      engine: 'valaxy',
    },
    foucGuard: {
      enabled: true,
      maxDuration: 5000,
    },
    taxonomyI18n: {
      level: 'warn',
    },
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
      extractImagePathsFromHTML: true,
    },
  },

  features: {
    katex: true,
  },

  math: false,

  cdn: {
    modules: [],
  },

  vite: {
    build: {
      emptyOutDir: true,
      /**
       * Disable CSS code splitting to prevent layout shift (CLS) on first load.
       *
       * When enabled (default), Vite splits CSS into per-chunk files (e.g. `app.xxx.css`)
       * that are loaded asynchronously. During SSG, beasties inlines only critical CSS and
       * defers the rest via `media="print"`, causing the full layout CSS to arrive late
       * and trigger a visible reflow/repaint.
       *
       * With `cssCodeSplit: false`, all CSS is bundled into a single file, allowing
       * beasties to extract critical styles more effectively and the FOUC guard
       * (`build.foucGuard`) to reliably detect when all styles are ready.
       */
      cssCodeSplit: false,
    },
  },
  vue: {
    browserTemplateCompilation: true,
  },

  devtools: true,
}

/**
 * Whether MathJax is enabled (takes priority over KaTeX).
 */
export function isMathJaxEnabled(config?: ValaxyNodeConfig | null): boolean {
  return !!config?.math
}

/**
 * Whether KaTeX is enabled (disabled when MathJax is active).
 */
export function isKatexEnabled(config?: ValaxyNodeConfig | null): boolean {
  if (config?.math)
    return false
  return config?.features?.katex !== false
}

/**
 * Whether the KaTeX markdown-it plugin should be registered.
 * Always true unless MathJax is active, so that per-page `frontmatter.katex: true`
 * can work even when `features.katex` is globally `false`.
 */
export function isKatexPluginNeeded(config?: ValaxyNodeConfig | null): boolean {
  return !config?.math
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
    const original = obj[key]
    obj[key] = function (...args: any[]) {
      original.call(this, ...args)
      value.call(this, ...args)
    }
    return true
  }
  /**
   * use array replace for default themeConfig
   */
  if (key === 'themeConfig') {
    // replaceArrMerge
    obj[key] = replaceArrMerge(value, obj[key])
    return true
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
