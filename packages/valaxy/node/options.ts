import { dirname, resolve } from 'path'
import fs from 'fs'
import _debug from 'debug'
import fg from 'fast-glob'
import { ensureSuffix, uniq } from '@antfu/utils'
import defu from 'defu'
import type { DefaultThemeConfig } from '../types'
import { resolveImportPath } from './utils'
import { getModuleRoot } from './utils/module'
import { mergeValaxyConfig, resolveAddonConfig, resolveValaxyConfig, resolveValaxyConfigFromRoot } from './utils/config'
import type { ValaxyAddonResolver, ValaxyConfig } from './types'
import { defaultSiteConfig } from './config'
import { parseAddonOptions } from './utils/parseAddons'

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
   * Theme name
   */
  roots: string[]
  theme: string
  /**
   * Valaxy Config
   */
  config: ValaxyConfig<ThemeConfig>
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

  const themeRoot = getModuleRoot(`valaxy-theme-${theme}`, options.userRoot)

  const roots = uniq([clientRoot, themeRoot, userRoot])

  // Important: fast-glob doesn't guarantee order of the returned files.
  // We must sort the pages so the input list to rollup is stable across
  // builds - otherwise different input order could result in different exports
  // order in shared chunks which in turns invalidates the hash of every chunk!
  // JavaScript built-in sort() is mandated to be stable as of ES2019 and
  // supported in Node 12+, which is required by Vite.
  const pages = (
    await fg(['**.md'], {
      cwd: userRoot,
      ignore: ['**/node_modules'],
    })
  ).sort()

  const valaxyOptions: ResolvedValaxyOptions = {
    mode,
    pkgRoot,
    clientRoot,
    userRoot,
    themeRoot,
    roots,
    theme,
    config: userValaxyConfig,
    configFile: configFile || '',
    pages,
    addons: [],
  }
  debug(valaxyOptions)

  // resolve theme valaxy.config.ts and merge theme
  const { config: themeValaxyConfig } = await resolveValaxyConfigFromRoot(themeRoot, valaxyOptions)
  let valaxyConfig = mergeValaxyConfig(userValaxyConfig, themeValaxyConfig)

  // resolve addon valaxyConfig
  const addons = await parseAddonOptions(valaxyConfig.addons || [])
  const addonValaxyConfig = await resolveAddonConfig(addons)
  valaxyConfig = mergeValaxyConfig(valaxyConfig, addonValaxyConfig)

  const config = defu(valaxyConfig, defaultSiteConfig)
  valaxyOptions.config = config
  valaxyOptions.addons = addons

  // optimize config
  config.url = ensureSuffix('/', config.url)
  // ensure suffix for cdn prefix
  config.cdn.prefix = ensureSuffix('/', config.cdn.prefix)

  // mount pkg info
  try {
    const pkg = fs.readFileSync(require.resolve(`valaxy-theme-${theme}/package.json`), 'utf-8')
    config.themeConfig.pkg = JSON.parse(pkg)
  }
  catch (e) {
    console.error(`valaxy-theme-${theme} doesn't have package.json`)
  }

  return valaxyOptions
}
