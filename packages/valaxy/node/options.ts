import { dirname, resolve } from 'path'
import fs from 'fs-extra'
import _debug from 'debug'
import fg from 'fast-glob'
import { ensureSuffix, uniq } from '@antfu/utils'
import defu from 'defu'
import consola from 'consola'
import { cyan, yellow } from 'kolorist'
import type { DefaultThemeConfig, RuntimeConfig } from '../types'
import { resolveImportPath } from './utils'
import { mergeValaxyConfig, resolveAddonConfig, resolveValaxyConfig, resolveValaxyConfigFromRoot } from './utils/config'
import type { ValaxyAddonResolver, ValaxyNodeConfig } from './types'
import { defaultValaxyConfig } from './config'
import { parseAddons } from './utils/addons'
import { getThemeRoot } from './utils/theme'
import { resolveSiteConfig } from './config/site'

// for cli entry
export interface ValaxyEntryOptions {
  /**
   * theme name
   */
  theme?: string
  userRoot: string
}

export interface ResolvedValaxyOptions<ThemeConfig = DefaultThemeConfig> {
  mode: 'dev' | 'build'
  /**
   * package.json root
   */
  pkgRoot: string
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
   * Theme name
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
  pages: string[]
  /**
   * all addons
   * Record<package-name, OptionResolver>
   */
  addons: ValaxyAddonResolver[]
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
    },
  }
  valaxyOptions.addons = addons

  addons.forEach((addon) => {
    valaxyOptions.config.runtimeConfig.addons[addon.name] = addon
  })

  const addonRoots = addons.map(({ root }) => root)
  valaxyOptions.addonRoots = addonRoots
  // ensure order
  valaxyOptions.roots = uniq([clientRoot, themeRoot, ...addonRoots, userRoot])

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

  let { config: userValaxyConfig, configFile, theme } = await resolveValaxyConfig(options)
  const { siteConfig, siteConfigFile } = await resolveSiteConfig(options.userRoot)

  // merge with valaxy
  userValaxyConfig = defu<ValaxyNodeConfig, any>({ siteConfig }, userValaxyConfig)

  const themeRoot = getThemeRoot(theme, options.userRoot)

  // Important: fast-glob doesn't guarantee order of the returned files.
  // We must sort the pages so the input list to rollup is stable across
  // builds - otherwise different input order could result in different exports
  // order in shared chunks which in turns invalidates the hash of every chunk!
  // JavaScript built-in sort() is mandated to be stable as of ES2019 and
  // supported in Node 12+, which is required by Vite.
  const pages = (
    await fg(['**.md'], {
      cwd: resolve(userRoot, 'pages'),
      ignore: ['**/node_modules'],
    })
  ).sort()

  let valaxyOptions: ResolvedValaxyOptions = {
    mode,
    pkgRoot,
    clientRoot,
    userRoot,
    themeRoot,
    addonRoots: [],
    roots: [],
    theme,
    config: {
      ...userValaxyConfig,
      runtimeConfig: { addons: {} },
    },
    configFile: configFile || '',
    siteConfigFile: siteConfigFile || '',
    pages,
    addons: [],
  }
  debug(valaxyOptions)

  // resolve theme valaxy.config.ts and merge theme
  const themeValaxyConfig = await resolveThemeValaxyConfig(valaxyOptions)
  const valaxyConfig = mergeValaxyConfig(userValaxyConfig, themeValaxyConfig)

  valaxyOptions = await processValaxyOptions(valaxyOptions, valaxyConfig)
  return valaxyOptions
}

/**
 * resolve theme config
 * @param options
 * @returns
 */
export async function resolveThemeValaxyConfig(options: ResolvedValaxyOptions) {
  consola.info(`Resolve ${cyan('valaxy.config.ts')} from ${yellow(`theme(${options.theme})`)}`)
  const { config: themeValaxyConfig } = await resolveValaxyConfigFromRoot(options.themeRoot, options)
  return themeValaxyConfig
}
