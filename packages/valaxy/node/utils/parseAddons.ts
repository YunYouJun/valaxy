import { resolve } from 'path'
import fs from 'fs-extra'
import consola from 'consola'
import defu from 'defu'
import type { ValaxyAddonLike, ValaxyAddonOptions, ValaxyAddonResolver, ValaxyAddonResolvers } from '../types'
import { getModuleRoot } from './module'

export async function parseAddonOptions(options: ValaxyAddonOptions) {
  const resolvers: ValaxyAddonResolvers = {}
  const mergeResolver = (resolver?: ValaxyAddonResolver) => {
    if (resolver)
      resolvers[resolver.name] = defu(resolvers[resolver.name] || {}, resolver)
  }
  if (Array.isArray(options)) {
    for (const option of options) {
      if (typeof option === 'string') {
        mergeResolver(await parseAddonModule(option))
        continue
      }
      if (Array.isArray(option)) {
        const [name, like] = option
        mergeResolver(await parseAddonModule(name, parseAddonLike(like)))
        continue
      }
    }
  }
  if (typeof options === 'object') {
    for (const [name, like] of Object.entries(options))
      mergeResolver(await parseAddonModule(name, parseAddonLike(like)))
  }
  return resolvers
}

export async function parseAddonModule(target: string, options?: Partial<ValaxyAddonResolver>) {
  const root = getModuleRoot(target)

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
