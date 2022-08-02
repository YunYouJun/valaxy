import { dirname, resolve } from 'path'
import fs from 'fs-extra'
import consola from 'consola'
import defu from 'defu'
import type { ResolvedValaxyOptions } from 'valaxy'
import { sync as resolveSync } from 'resolve'
import type { ValaxyAddonLike, ValaxyAddonOptions, ValaxyAddonResolver } from '../types'
import { isPath } from '.'

export interface ReadAddonModuleOptions {
  valaxy?: Partial<ResolvedValaxyOptions>
  extends?: Partial<ValaxyAddonResolver>
}

export async function parseAddonOptions(addons: ValaxyAddonOptions, valaxy: Partial<ResolvedValaxyOptions> = {}) {
  const resolvers: Record<string, ValaxyAddonResolver > = {}
  const mergeResolver = (resolver?: ValaxyAddonResolver) => {
    if (resolver)
      resolvers[resolver.name] = defu(resolvers[resolver.name] || {}, resolver)
  }
  if (Array.isArray(addons)) {
    for (const option of addons) {
      if (typeof option === 'string') {
        mergeResolver(await readAddonModule(option, { valaxy }))
        continue
      }
      if (Array.isArray(option)) {
        const [name, like] = option
        mergeResolver(await readAddonModule(name, { valaxy, extends: parseAddonLike(like) }))
      }
    }
  }
  else if (typeof addons === 'object') {
    for (const [name, like] of Object.entries(addons))
      mergeResolver(await readAddonModule(name, { valaxy, extends: parseAddonLike(like) }))
  }

  return Object.values(resolvers).filter(item => item.enable)
}

/**
 * read module from addon name
 * @internal
 * @param name
 * @param options
 * @returns
 */
export async function readAddonModule(name: string, options: ReadAddonModuleOptions = {}) {
  let root = ''

  if (!root)
    root = getAddonRoot(name, options.valaxy?.userRoot)
  if (!root)
    root = getAddonRoot(name, options.valaxy?.themeRoot)
  if (!root)
    root = getAddonRoot(name, process.cwd())

  const packageJSONPath = resolve(root, './package.json')
  if (!fs.existsSync(packageJSONPath)) {
    consola.error(`No addon named ${name} found`)
    return
  }
  const packageJSON = await fs.readJSON(packageJSONPath)

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
 * @param name valaxy-addon-name
 * @param entry
 * @returns
 */
export function getAddonRoot(name: string, entry?: string) {
  const addonModule = (name.startsWith('valaxy-addon') || name.startsWith('.')) ? name : `valaxy-addon-${name}`
  if (isPath(name)) {
    if (entry) {
      const isFile = fs.lstatSync(entry).isFile()
      return resolve(isFile ? dirname(entry) : entry, name)
    }
  }
  try {
    return dirname(resolveSync(`${addonModule}/package.json`, { basedir: entry, preserveSymlinks: false }))
  }
  catch {
    return ''
  }
}
