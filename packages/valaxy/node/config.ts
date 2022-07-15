// import { loadConfig } from 'c12'
import fs from 'fs-extra'
import defu from 'defu'
import { ensureSuffix } from '@antfu/utils'
import { normalizePath } from 'vite'
import { loadConfig } from 'unconfig'
import type { VitePluginConfig as UnoCssConfig } from 'unocss/vite'
import type { Awaitable } from '@antfu/utils'
import type { UserConfig, ValaxyBlogConfig } from '../types'
import type { ResolvedValaxyOptions, ValaxyEntryOptions, ValaxyTheme } from './options'

/**
 * Type config helper
 */
export function defineBlog<ThemeConfig>(config: UserConfig<ThemeConfig>) {
  return config
}

/**
 * Type config helper for custom theme config
 */
export function defineBlogWithTheme<ThemeConfig>(
  config: UserConfig<ThemeConfig>,
) {
  return config
}

const defaultBlogConfig: ValaxyBlogConfig = {
  mode: 'auto',
  url: '/',
  lang: 'en',
  title: 'Valaxy Blog',
  description: 'A blog generated by Valaxy.',
  subtitle: 'Next Generation Static Blog Framework.',
  author: {
    avatar: 'https://www.yunyoujun.cn/images/avatar.jpg',
    email: 'me@yunyoujun.cn',
    link: 'https://www.yunyoujun.cn',
    name: 'YunYouJun',
    status: {
      emoji: '😊',
      message: 'All at sea.',
    },
  },
  favicon: '/favicon.svg',
  feed: {
    name: '',
    favicon: '/favicon.svg',
  },
  social: [],

  date: {
    format: '',
  },
  lastUpdated: true,

  license: {
    enabled: true,
    language: '',
    type: 'by-nc-sa',
  },

  sponsor: {
    enable: true,
    title: '我很可爱，请给我钱',
    methods: [],
  },

  search: {
    enable: false,
    algolia: {
      enable: false,
      appId: '',
      apiKey: '',
      indexName: '',
    },
  },

  comment: {
    enable: false,
    waline: {
      enable: false,
      serverURL: '',
    },
    twikoo: {
      enable: false,
      envId: 'https://twikoo.vercel.app',
    },
  },

  cdn: {
    prefix: 'https://npm.elemecdn.com/',
  },

  features: {
    katex: true,
  },

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
}

// for user config
export async function resolveBlogConfig(options: ValaxyEntryOptions = {}) {
  // c12 merge array twice, so i deprecated it
  // const { config, configFile } = await loadConfig<ValaxyBlogConfig>({
  //   name: 'valaxy',
  //   defaults: defaultBlogConfig,
  // })

  const { config: userConfig, sources } = await loadConfig<ValaxyBlogConfig>({
    sources: [
      {
        files: 'blog.config',
        extensions: ['ts', 'js', 'mjs', 'cjs', 'json'],
      },
    ],
    merge: false,
  })

  const configFile = normalizePath(sources[0] || '')

  const config = defu(userConfig, defaultBlogConfig)
  // ensure suffix for cdn prefix
  config.cdn.prefix = ensureSuffix('/', config.cdn.prefix)

  const theme = options.theme || config.theme || 'yun'

  try {
    const { defaultThemeConfig } = await import(`valaxy-theme-${theme}`)
    config.themeConfig = defu(config.themeConfig, defaultThemeConfig)
  }
  catch (e) {
    console.error(`valaxy-theme-${theme} doesn't have default config`)
  }

  try {
    const pkg = fs.readFileSync(require.resolve(`valaxy-theme-${theme}/package.json`), 'utf-8')
    config.themeConfig.pkg = JSON.parse(pkg)
  }
  catch (e) {
    console.error(`valaxy-theme-${theme} doesn't have package.json`)
  }

  config.url = ensureSuffix('/', config.url)

  return {
    config,
    configFile,
    theme,
  }
}

export type ThemeConfigExport = ValaxyTheme | Promise<ValaxyTheme> | ThemeConfigFn
export type ThemeConfigFn = (options: ResolvedValaxyOptions) => ValaxyTheme | Promise<ValaxyTheme>

export function defineTheme(config: ThemeConfigExport) {
  return config
}

export type UnoSetup = () => Awaitable<Partial<UnoCssConfig> | undefined>

export function defineUnoSetup(fn: UnoSetup) {
  return fn
}
