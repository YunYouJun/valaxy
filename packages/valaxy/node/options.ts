import { dirname } from 'node:path'
import process from 'node:process'
import { resolve } from 'pathe'
import fs from 'fs-extra'
import _debug from 'debug'
import fg from 'fast-glob'
import { ensureSuffix, uniq } from '@antfu/utils'
import defu from 'defu'
import { blue, cyan, magenta, yellow } from 'picocolors'
import consola from 'consola'
import type { DefaultTheme, RedirectItem, RuntimeConfig } from 'valaxy/types'
import { resolveImportPath } from './utils'
import {
  defaultValaxyConfig,
  mergeValaxyConfig,
  resolveAddonConfig,
  resolveThemeConfigFromRoot,
  resolveValaxyConfig,
  resolveValaxyConfigFromRoot,
} from './config'
import type { ValaxyAddonResolver, ValaxyNodeConfig } from './types'
import { parseAddons } from './utils/addons'
import { getThemeRoot } from './utils/theme'
import { resolveSiteConfig } from './config/site'
import { countPerformanceTime } from './utils/performance'
import { collectRedirects } from './utils/clientRedirects'

// for cli entry
export interface ValaxyEntryOptions {
  /**
   * theme name
   */
  theme?: string
  userRoot: string
}

export interface ResolvedValaxyOptions<ThemeConfig = DefaultTheme.Config> {
  mode: 'dev' | 'build'
  /**
   * package.json root
   */
  pkgRoot: string
  /**
   * temp dir, store d.ts and other temp files
   * .valaxy
   */
  tempDir: string
  /**
   * Client root path
   * @default 'valaxy/client'
   */
  clientRoot: string
  /**
   * User root path
   * @default process.cwd()
   */
  userRoot: string
  /**
   * Theme root path
   */
  themeRoot: string
  /**
   * Addon root path
   */
  addonRoots: string[]
  /**
   * clientRoot, themeRoot, ...addonRoots, userRoot
   */
  roots: string[]
  theme: string
  /**
   * Valaxy Config
   */
  config: ValaxyNodeConfig<ThemeConfig> & {
    /**
     * Generated Runtime Config
     */
    runtimeConfig: RuntimeConfig
  }
  /**
   * config file path
   */
  configFile: string
  siteConfigFile: string
  themeConfigFile: string
  pages: string[]
  /**
   * all addons
   * Record<package-name, OptionResolver>
   */
  addons: ValaxyAddonResolver[]
  /**
   * Collect redirect rule
   */
  redirects: RedirectItem[]
}

export interface ValaxyServerOptions {
  onConfigReload?: (newConfig: ValaxyNodeConfig, config: ValaxyNodeConfig, force?: boolean) => void
}

const debug = _debug('valaxy:options')

/**
 * post process site config
 * @param options
 */
async function processSiteConfig(options: ResolvedValaxyOptions) {
  const { config, themeRoot, theme } = options

  const siteConfig = config.siteConfig
  // optimize config
  siteConfig.url = ensureSuffix('/', siteConfig.url || '')
  // ensure suffix for cdn prefix
  siteConfig.cdn!.prefix = ensureSuffix('/', siteConfig.cdn!.prefix || '')

  // mount pkg info
  const themePkgPath = resolve(themeRoot, 'package.json')
  try {
    config.themeConfig!.pkg = await fs.readJson(themePkgPath, 'utf-8')
  }
  catch (e) {
    console.error(`valaxy-theme-${theme} doesn't have package.json`)
  }
}

/**
 * Post process valaxyOptions
 * @param valaxyOptions
 * @param valaxyConfig
 */
export async function processValaxyOptions(valaxyOptions: ResolvedValaxyOptions, valaxyConfig: ValaxyNodeConfig) {
  const { clientRoot, themeRoot, userRoot } = valaxyOptions

  // resolve addon valaxyConfig
  const addons = await parseAddons(valaxyConfig.addons || [], valaxyOptions.userRoot)
  const addonValaxyConfig = await resolveAddonConfig(addons, valaxyOptions)
  valaxyConfig = mergeValaxyConfig(valaxyConfig, addonValaxyConfig)

  const config = defu(valaxyConfig, defaultValaxyConfig)
  valaxyOptions.config = {
    ...config,
    runtimeConfig: {
      addons: {},
      redirects: {
        useVueRouter: true,
        redirectRoutes: [],
      },
    },
  }
  valaxyOptions.addons = addons

  addons.forEach((addon) => {
    valaxyOptions.config.runtimeConfig.addons[addon.name] = addon
  })

  const addonRoots = addons.map(({ root }) => root)
  const addonNames = addons.map(({ name }) => name)
  valaxyOptions.addonRoots = addonRoots
  // ensure order
  valaxyOptions.roots = uniq([clientRoot, themeRoot, ...addonRoots, userRoot])

  // when addon be used, remove it from external
  const external = valaxyOptions.config.vite?.build?.rollupOptions?.external as string[] || []
  valaxyOptions.config.vite!.build!.rollupOptions!.external = external.filter(name => !addonNames.includes(name))

  await processSiteConfig(valaxyOptions)

  return valaxyOptions
}

// for cli options
export async function resolveOptions(
  options: ValaxyEntryOptions = { userRoot: process.cwd() },
  mode: ResolvedValaxyOptions['mode'] = 'dev',
) {
  const pkgRoot = dirname(resolveImportPath('valaxy/package.json', true))
  const clientRoot = resolve(pkgRoot, 'client')
  const userRoot = resolve(options.userRoot || process.cwd())

  consola.start(`Resolve ${magenta('valaxy')} config...`)
  const [resolvedValaxy, resolvedSite, resolvedTheme, pages] = await Promise.all([
    resolveValaxyConfig(options),
    resolveSiteConfig(options.userRoot),
    // resolveThemeConfig(options),
    resolveThemeConfigFromRoot(options.userRoot),

    fg(['**.md'], {
      cwd: resolve(userRoot, 'pages'),
      ignore: ['**/node_modules'],
    }),
  ])

  let { config: userValaxyConfig, configFile, theme } = resolvedValaxy

  const themeRoot = getThemeRoot(theme, options.userRoot)

  const { siteConfig, siteConfigFile } = resolvedSite

  const { config: themeConfig, configFile: themeConfigFile } = resolvedTheme

  const redirects = collectRedirects(siteConfig.redirects?.rules)

  // merge with valaxy
  userValaxyConfig = defu<ValaxyNodeConfig, any>({ siteConfig }, { themeConfig }, userValaxyConfig)

  // pages
  // Important: fast-glob doesn't guarantee order of the returned files.
  // We must sort the pages so the input list to rollup is stable across
  // builds - otherwise different input order could result in different exports
  // order in shared chunks which in turns invalidates the hash of every chunk!
  // JavaScript built-in sort() is mandated to be stable as of ES2019 and
  // supported in Node 12+, which is required by Vite.

  let valaxyOptions: ResolvedValaxyOptions = {
    mode,
    pkgRoot,
    tempDir: resolve(userRoot, '.valaxy'),
    clientRoot,
    userRoot,
    themeRoot,
    addonRoots: [],
    roots: [],
    theme,
    config: {
      ...userValaxyConfig,
      runtimeConfig: {
        addons: {},
        redirects: {
          useVueRouter: true,
          redirectRoutes: [],
        },
      },
    },
    configFile: configFile || '',
    siteConfigFile: siteConfigFile || '',
    themeConfigFile: themeConfigFile || '',
    pages: pages.sort(),
    addons: [],
    redirects,
  }
  debug(valaxyOptions)

  // resolve theme valaxy.config.ts and merge theme
  const themeValaxyConfig = await resolveThemeValaxyConfig(valaxyOptions)
  const valaxyConfig = mergeValaxyConfig(userValaxyConfig, themeValaxyConfig)

  valaxyOptions = await processValaxyOptions(valaxyOptions, valaxyConfig)

  // ensure .valaxy folder to store temp files, like d.ts
  fs.ensureDirSync(valaxyOptions.tempDir)
  return valaxyOptions
}

/**
 * resolve theme config
 * @param options
 */
export async function resolveThemeValaxyConfig(options: ResolvedValaxyOptions) {
  const endCount = countPerformanceTime()
  const { config: themeValaxyConfig } = await resolveValaxyConfigFromRoot(options.themeRoot, options)
  const duration = endCount()

  if (themeValaxyConfig)
    consola.success(`Resolve ${cyan('valaxy.config.ts')} from ${blue(`theme(${options.theme})`)} ${yellow(duration)}`)
  return themeValaxyConfig
}
