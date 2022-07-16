import { join } from 'path'
import isInstalledGlobally from 'is-installed-globally'
import globalDirs from 'global-dirs'
import { sync as resolve } from 'resolve'
import consola from 'consola'
import { createDefu } from 'defu'
import { isFunction } from '@antfu/utils'
import { mergeConfig as mergeViteConfig } from 'vite'

export * from './getGitTimestamp'

export const EXTERNAL_URL_RE = /^https?:/i

export const mergeFullConfig = createDefu((obj: any, key, value) => {
  if (isFunction(obj[key]) && isFunction(value)) {
    obj[key] = function (...args: any[]) {
      obj[key].call(this, ...args)
      value.call(this, ...args)
    }
  }
  if (key === 'vite') {
    // a deep copy and needs to be taken over
    obj[key] = mergeViteConfig(obj[key], value)
    return true
  }
})
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

export function resolveImportPath(importName: string, ensure: true): string
export function resolveImportPath(importName: string, ensure?: boolean): string | undefined
export function resolveImportPath(importName: string, ensure = false) {
  try {
    return resolve(importName, {
      preserveSymlinks: false,
    })
  }
  catch {}

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

