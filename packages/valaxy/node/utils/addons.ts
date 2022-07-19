import { dirname, resolve } from 'path'
import fs from 'fs-extra'
import consola from 'consola'
import defu from 'defu'
import { sync as resolveImportPath } from 'resolve'
import type { ValaxyAddonLike, ValaxyAddonOptions, ValaxyAddonResolver } from '../types'
import { isPath } from '.'

export interface ReadAddonModuleOptions {
  cwd?: string
  extends?: Partial<ValaxyAddonResolver>
}

export async function parseAddonOptions(options: ValaxyAddonOptions, userRoot = process.cwd()) {
  const resolvers: Record<string, ValaxyAddonResolver > = {}
  const mergeResolver = (resolver?: ValaxyAddonResolver) => {
    if (resolver)
      resolvers[resolver.name] = defu(resolvers[resolver.name] || {}, resolver)
  }
  if (Array.isArray(options)) {
    for (const option of options) {
      if (typeof option === 'string') {
        mergeResolver(await readAddonModule(option, { cwd: userRoot }))
        continue
      }
      if (Array.isArray(option)) {
        const [name, like] = option
        mergeResolver(await readAddonModule(name, { cwd: userRoot, extends: parseAddonLike(like) }))
      }
    }
  }
  else if (typeof options === 'object') {
    for (const [name, like] of Object.entries(options))
      mergeResolver(await readAddonModule(name, { cwd: userRoot, extends: parseAddonLike(like) }))
  }

  return Object.values(resolvers).filter(item => item.enable)
}

export async function readAddonModule(name: string, options: ReadAddonModuleOptions = {}) {
  const root = getAddonRoot(name, options.cwd || process.cwd())

  const packageJSONPath = resolve(root, './package.json')
  if (!fs.existsSync(packageJSONPath)) {
    consola.error(`No addon named ${name} found`)
    return
  }
  const packageJSON = fs.readJSONSync(packageJSONPath)

  const resolver: ValaxyAddonResolver = {
    enable: true,
    name: packageJSON.name,
    global: !!packageJSON.global,
    root,
    options: {},
    props: {},
  }
  return defu(resolver, options.extends || {})
}

export function parseAddonLike(like: ValaxyAddonLike) {
  const option: Partial<ValaxyAddonResolver> = { enable: true }
  if (like === false)
    option.enable = false
  if (typeof like === 'object')
    Object.assign(option, like)
  return option
}

/**
 * get addon root
 * @param name
 * @param entry
 * @returns
 */
export function getAddonRoot(name: string, entry?: string) {
  if (!name)
    return ''

  if (isPath(name)) {
    if (entry)
      return resolve(dirname(entry), name)
    else
      throw new Error(`entry is required when ${name} is path`)
  }

  else {
    return dirname(resolveImportPath(`${name}/package.json`, {
      preserveSymlinks: false,
      basedir: entry,
    }))
  }
}
