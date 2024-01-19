// ref slidev
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import { isObject } from '@antfu/utils'
import jiti from 'jiti'

function deepMerge(a: any, b: any, rootPath = '') {
  a = { ...a }
  Object.keys(b).forEach((key) => {
    if (isObject(a[key]))
      a[key] = deepMerge(a[key], b[key], rootPath ? `${rootPath}.${key}` : key)
    else if (Array.isArray(a[key]))
      a[key] = [...a[key], ...b[key]]
    else
      a[key] = b[key]
  })
  return a
}

export async function loadSetups<T, R extends object>(roots: string[], name: string, arg: T, initial: R, merge = true): Promise<R> {
  let returns = initial
  for (const root of roots) {
    const path = resolve(root, 'setup', name)
    if (fs.existsSync(path)) {
      const { default: setup } = jiti(fileURLToPath(import.meta.url), {
        esmResolve: true,
      })(path)
      const result = await setup(arg)
      if (result !== null) {
        returns = merge
          ? deepMerge(returns, result)
          : result
      }
    }
  }
  return returns
}
