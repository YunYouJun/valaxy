import { dirname, resolve } from 'path'
import { resolveImportPath } from './utils'

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
    return dirname(resolveImportPath(`${name}/package.json`))
}

// for cli options
export function resolveOptions(options: ValaxyEntryOptions): ResolvedValaxyOptions {
  const clientRoot = resolve(__dirname, '../client')
  const userRoot = dirname(options.userRoot || process.cwd())
  const themeRoot = getThemeRoot('', userRoot)

  return {
    clientRoot,
    userRoot,
    themeRoot,
  }
}
