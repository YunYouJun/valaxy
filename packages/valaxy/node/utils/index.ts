import { join } from 'path'
import isInstalledGlobally from 'is-installed-globally'
import globalDirs from 'global-dirs'
import type resolve from 'resolve'
import { sync as resolveSync } from 'resolve'
import consola from 'consola'
import type { LoadConfigSource } from 'unconfig'
import { loadConfig } from 'unconfig'

export * from './getGitTimestamp'

export const EXTERNAL_URL_RE = /^https?:/i

/**
 * transform obj for vite code
 * @param obj
 * @returns
 */
export const transformObject = (obj: any) => {
  return `JSON.parse(${JSON.stringify(JSON.stringify(obj))})`
}

export function slash(str: string) {
  return str.replace(/\\/g, '/')
}

export function ensurePrefix(prefix: string, str: string) {
  if (!str.startsWith(prefix))
    return prefix + str
  return str
}

export function toAtFS(path: string) {
  return `/@fs${ensurePrefix('/', slash(path))}`
}

export function isPath(name: string) {
  return name.startsWith('/') || /^\.\.?[\/\\]/.test(name)
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

export interface LoadConfigFromFilesOptions {
  cwd?: string
  rewrite?: LoadConfigSource['rewrite']
}
export async function loadConfigFromFiles<T>(files: string, options: LoadConfigFromFilesOptions = {}) {
  return await loadConfig<T>({
    sources: { files, rewrite: options.rewrite },
    cwd: options.cwd || process.cwd(),
  })
}
