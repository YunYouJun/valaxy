import consola from 'consola'

import { sync as resolve } from 'resolve'

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
