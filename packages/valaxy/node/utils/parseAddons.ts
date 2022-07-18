import { dirname, resolve } from 'path'
import fs from 'fs-extra'
import consola from 'consola'
import defu from 'defu'
import { sync as resolveModulePath } from 'resolve'
import type { ValaxyAddonLike, ValaxyAddonOptions, ValaxyAddonResolver } from '../types'

export async function parseAddonOptions(options: ValaxyAddonOptions, userRoot: string) {
  const resolvers: Record<string, ValaxyAddonResolver > = {}
  const mergeResolver = (resolver?: ValaxyAddonResolver) => {
    if (resolver)
      resolvers[resolver.name] = defu(resolvers[resolver.name] || {}, resolver)
  }
  if (Array.isArray(options)) {
    for (const option of options) {
      if (typeof option === 'string') {
        mergeResolver(await parseAddonModule(userRoot, option))
        continue
      }
      if (Array.isArray(option)) {
        const [name, like] = option
        mergeResolver(await parseAddonModule(userRoot, name, parseAddonLike(like)))
      }
    }
  }
  else if (typeof options === 'object') {
    for (const [name, like] of Object.entries(options))
      mergeResolver(await parseAddonModule(userRoot, name, parseAddonLike(like)))
  }
  return Object.values(resolvers)
}

export async function parseAddonModule(userRoot: string, target: string, options?: Partial<ValaxyAddonResolver>) {
  const root = dirname(resolveModulePath(`${target}`, {
    preserveSymlinks: false,
    basedir: userRoot,
  }))

  const packageJSONPath = resolve(root, './package.json')

  if (!fs.existsSync(packageJSONPath)) {
    consola.error(`not found ${target}`)
    return
  }

  const packageJSON = fs.readJSONSync(packageJSONPath)
  let resolver: ValaxyAddonResolver = {
    enable: true,
    name: target,
    root,
    global: !!packageJSON.global,
    options: {},
    props: {},
  }

  if (options)
    resolver = defu(resolver, options)

  return resolver
}

export function parseAddonLike(like: ValaxyAddonLike) {
  const option: Partial<ValaxyAddonResolver> = { enable: true }
  if (like === false)
    option.enable = false
  if (typeof like === 'object')
    Object.assign(option, like)
  return option
}
