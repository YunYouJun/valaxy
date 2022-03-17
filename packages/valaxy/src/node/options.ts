import { dirname, resolve } from 'path'
import _debug from 'debug'
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

export interface ResolvedValaxyOptions {
  /**
   * Client root path
   * @default 'valaxy/src/client'
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
  theme: string
  /**
   * Valaxy Config
   */
  config: ValaxyConfig
  /**
   * config file path
   */
  configFile: string
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
    return dirname(resolveImportPath(`valaxy-theme-${name}/package.json`))
}

// for cli options
export async function resolveOptions(options: ValaxyEntryOptions) {
  const clientRoot = resolve(dirname(resolveImportPath('valaxy/package.json')), 'src/client')
  const userRoot = resolve(options.userRoot || process.cwd())

  const { config: valaxyConfig, configFile, theme } = await resolveConfig(options)
  const themeRoot = getThemeRoot(theme, userRoot)

  const valaxyOptions: ResolvedValaxyOptions = {
    clientRoot,
    userRoot,
    themeRoot,
    theme,
    config: valaxyConfig,
    configFile: configFile || '',
  }
  debug(valaxyOptions)

  return valaxyOptions
}
