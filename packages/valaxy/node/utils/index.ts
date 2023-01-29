import { join } from 'path'
import isInstalledGlobally from 'is-installed-globally'
import globalDirs from 'global-dirs'
import type resolve from 'resolve'
import { sync as resolveSync } from 'resolve'
import consola from 'consola'

export * from './getGitTimestamp'
export * from './helper'
export * from './config'

/**
 * transform obj for vite code
 * @param obj
 * @returns
 */
export const transformObject = (obj: any) => {
  return `JSON.parse(${JSON.stringify(JSON.stringify(obj))})`
}

export function resolveImportPath(importName: string, ensure?: true): string
export function resolveImportPath(importName: string, ensure = false, resolveOptions: resolve.SyncOpts = {
  preserveSymlinks: false,
}) {
  try {
    return resolveSync(importName, resolveOptions)
  }
  catch (error) {
    consola.log(error)
  }

  if (isInstalledGlobally) {
    try {
      return require.resolve(join(globalDirs.yarn.packages, importName))
    }
    catch {}

    try {
      return require.resolve(join(globalDirs.npm.packages, importName))
    }
    catch {}
  }

  if (ensure)
    throw new Error(`Failed to resolve package ${importName}`)

  consola.error(`Failed to resolve package ${importName}`)
  return undefined
}
