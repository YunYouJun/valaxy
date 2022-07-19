import { dirname, resolve } from 'path'
import { isPath, resolveImportPath } from '../utils'

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
