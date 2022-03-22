import consola from 'consola'

import { sync as resolve } from 'resolve'

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

export function resolveImportPath(importName: string) {
  try {
    return resolve(importName, {
      preserveSymlinks: false,
    })
  }
  catch { }

  consola.error(`Failed to resolve package ${importName}`)
  throw new Error(`Failed to resolve package ${importName}`)
}
