import { dirname } from 'path'
import consola from 'consola'

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
    return dirname(require.resolve(importName))
  }
  catch { }

  consola.error(`Failed to resolve package ${importName}`)
  throw new Error(`Failed to resolve package ${importName}`)
}
