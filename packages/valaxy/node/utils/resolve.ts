import consola from 'consola'
import { resolvePath } from 'mlly'
import { resolveGlobal } from 'resolve-global'

export const isInstalledGlobally: { value?: boolean } = {}

/**
 * Before is CJS: use 'resolve'
 * ESM: use 'mlly'
 */
export async function resolveImportPath(importName: string, ensure?: true): Promise<string>
export async function resolveImportPath(importName: string, ensure?: boolean): Promise<string | undefined>
export async function resolveImportPath(importName: string, ensure = false) {
  try {
    return await resolvePath(importName, {
      url: import.meta.url,
    })
  }
  catch (error) {
    consola.log(error)
  }

  if (isInstalledGlobally.value) {
    try {
      return resolveGlobal(importName)
    }
    catch {}
  }

  if (ensure)
    throw new Error(`Failed to resolve package ${importName}`)
  else
    consola.warn(`Failed to resolve package ${importName}`)
}
