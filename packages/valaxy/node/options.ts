import { dirname, resolve } from 'path'
import fs from 'fs-extra'
import _debug from 'debug'
import fg from 'fast-glob'
import { ensureSuffix, uniq } from '@antfu/utils'
import defu from 'defu'
import type { DefaultThemeConfig, ValaxyAddon } from '../types'
import { resolveImportPath } from './utils'
import { mergeValaxyConfig, resolveAddonConfig, resolveValaxyConfig, resolveValaxyConfigFromRoot } from './utils/config'
import type { ValaxyAddonResolver, ValaxyConfig } from './types'
import { defaultSiteConfig } from './config'
import { parseAddonOptions } from './utils/addons'
import { getThemeRoot } from './utils/theme'

// for cli entry
export interface ValaxyEntryOptions {
  /**
   * theme name
   */
  theme?: string
  userRoot?: string
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
  config: ValaxyConfig<ThemeConfig> & {
    /**
     * Generated Runtime Config
     */
    runtime: { addons: Record<string, ValaxyAddon> }
  }
  /**
   * config file path
   */
  configFile: string
  pages: string[]
  /**
   * all addons
   * Record<package-name, OptionResolver>
   */
  addons: ValaxyAddonResolver[]
}

export interface ValaxyServerOptions {
  onConfigReload?: (newConfig: ValaxyConfig, config: ValaxyConfig, force?: boolean) => void
}

const debug = _debug('valaxy:options')

// for cli options
export async function resolveOptions(options: ValaxyEntryOptions, mode: ResolvedValaxyOptions['mode'] = 'dev') {
  const pkgRoot = dirname(resolveImportPath('valaxy/package.json', true))
  const clientRoot = resolve(pkgRoot, 'client')
  const userRoot = resolve(options.userRoot || process.cwd())

  const { config: userValaxyConfig, configFile, theme } = await resolveValaxyConfig(options)

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

  const valaxyOptions: ResolvedValaxyOptions = {
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
      runtime: { addons: {} },
    },
    configFile: configFile || '',
    pages,
    addons: [],
  }
  debug(valaxyOptions)

  // resolve theme valaxy.config.ts and merge theme
  const { config: themeValaxyConfig } = await resolveValaxyConfigFromRoot(themeRoot, valaxyOptions)
  let valaxyConfig = mergeValaxyConfig(userValaxyConfig, themeValaxyConfig)

  // resolve addon valaxyConfig
  const addons = await parseAddonOptions(valaxyConfig.addons || [], valaxyOptions.userRoot)
  const addonValaxyConfig = await resolveAddonConfig(addons, valaxyOptions)
  valaxyConfig = mergeValaxyConfig(valaxyConfig, addonValaxyConfig)

  const config = defu(valaxyConfig, defaultSiteConfig)
  valaxyOptions.config = {
    ...config,
    runtime: {
      addons: {},
    },
  }
  valaxyOptions.addons = addons

  addons.forEach((addon) => {
    valaxyOptions.config.runtime.addons[addon.name] = addon
  })

  const addonRoots = addons.map(({ root }) => root)
  valaxyOptions.addonRoots = addonRoots
  // ensure order
  valaxyOptions.roots = uniq([clientRoot, themeRoot, ...addonRoots, userRoot])

  await processSiteConfig(valaxyOptions)
  return valaxyOptions
}

/**
 * post process site config
 * @param options
 */
async function processSiteConfig(options: ResolvedValaxyOptions) {
  const { config, themeRoot, theme } = options

  // optimize config
  config.url = ensureSuffix('/', config.url || '')
  // ensure suffix for cdn prefix
  config.cdn!.prefix = ensureSuffix('/', config.cdn!.prefix || '')

  // mount pkg info
  const themePkgPath = resolve(themeRoot, 'package.json')
  try {
    config.themeConfig!.pkg = await fs.readJson(themePkgPath, 'utf-8')
  }
  catch (e) {
    console.error(`valaxy-theme-${theme} doesn't have package.json`)
  }
}
