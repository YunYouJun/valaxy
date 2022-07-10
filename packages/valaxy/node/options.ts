import { dirname, resolve } from 'path'
import _debug from 'debug'
import fg from 'fast-glob'
import type Vue from '@vitejs/plugin-vue'
import type Components from 'unplugin-vue-components/vite'
import type { VitePluginConfig as UnoCSSConfig } from 'unocss/vite'
import { uniq } from '@antfu/utils'
import type Pages from 'vite-plugin-pages'
import type { ValaxyConfig } from '../types'
import { resolveConfig } from './config'
import { resolveImportPath } from './utils'

const debug = _debug('valaxy:options')

// for cli entry
export interface ValaxyEntryOptions {
  /**
   * theme name
   */
  theme?: string
  userRoot?: string
}

export interface ValaxyPluginOptions {
  vue?: Parameters<typeof Vue>[0]
  components?: Parameters<typeof Components>[0]
  unocss?: UnoCSSConfig
  pages?: Parameters<typeof Pages>[0]
  extendMd?: (ctx: {
    route: any
    data: Record<string, any>
    excerpt?: string
    path: string
  }) => void
}

export interface ResolvedValaxyOptions {
  mode: 'dev' | 'build'
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
  config: ValaxyConfig
  /**
   * config file path
   */
  configFile: string
  pages: string[]
}

export interface ValaxyServerOptions {
  onConfigReload?: (newConfig: ValaxyConfig, config: ValaxyConfig) => void
}

export function isPath(name: string) {
  return name.startsWith('/') || /^\.\.?[\/\\]/.test(name)
}

/**
 * get theme roots
 * @param name
 * @param entry
 * @returns
 */
export function getThemeRoot(name: string, entry: string) {
  if (!name)
    return ''

  if (isPath(name))
    return resolve(dirname(entry), name)
  else
    return dirname(resolveImportPath(`valaxy-theme-${name}/package.json`) || '')
}

// for cli options
export async function resolveOptions(options: ValaxyEntryOptions, mode: ResolvedValaxyOptions['mode'] = 'dev') {
  const clientRoot = resolve(dirname(resolveImportPath('valaxy/package.json', true)), 'client')
  const userRoot = resolve(options.userRoot || process.cwd())

  const { config: valaxyConfig, configFile, theme } = await resolveConfig(options)
  const themeRoot = getThemeRoot(theme, userRoot)

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
    clientRoot,
    userRoot,
    themeRoot,
    roots,
    theme,
    config: valaxyConfig,
    configFile: configFile || '',
    pages,
  }
  debug(valaxyOptions)

  return valaxyOptions
}
