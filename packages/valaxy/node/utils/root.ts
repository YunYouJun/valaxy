import { dirname, resolve } from 'path'
import { isPath, resolveImportPath } from '../utils'

/**
 * get theme roots
 * @param name
 * @param entry
 * @returns
 */
export function getModuleRoot(name: string, entry?: string) {
  if (!name)
    return ''

  if (isPath(name)) {
    if (entry)
      return resolve(dirname(entry), name)
    else
      throw new Error(`entry is required when ${name} is path`)
  }

  else { return dirname(resolveImportPath(`${name}/package.json`) || '') }
}
