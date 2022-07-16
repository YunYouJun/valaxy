import { dirname, resolve } from 'path'
import { resolveImportPath } from '../utils'

export function isPath(name: string) {
  return name.startsWith('/') || /^\.\.?[\/\\]/.test(name)
}

/**
 * get theme roots
 * @param name
 * @param entry
 * @returns
 */
export function getThemeRoot(name: string, entry?: string) {
  if (!name)
    return ''

  if (isPath(name)) {
    if (entry)
      return resolve(dirname(entry), name)
    else
      throw new Error('entry is required when theme is path')
  }

  else { return dirname(resolveImportPath(`valaxy-theme-${name}/package.json`) || '') }
}
