import { dirname } from 'node:path'
import fs from 'fs-extra'
import { resolve } from 'pathe'
import { isPath, resolveImportPath } from '../utils'

/**
 * get theme roots
 * @param name
 * @param entry
 */
export async function getModuleRoot(name: string, entry?: string) {
  if (!name)
    return ''

  if (isPath(name)) {
    if (entry) {
      const isFile = fs.lstatSync(entry).isFile()
      return resolve(isFile ? dirname(entry) : entry, name)
    }
    else { throw new Error(`entry is required when ${name} is path`) }
  }

  else {
    return resolve(dirname(await resolveImportPath(`${name}/package.json`) || ''))
  }
}
