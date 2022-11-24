import { resolve } from 'path'
import fs from 'fs-extra'
import consola from 'consola'
import defu from 'defu'
import type { ValaxyAddonResolver, ValaxyAddons } from '../types'
import { getModuleRoot } from './root'

export interface ReadAddonModuleOptions {
  cwd?: string
}

export async function parseAddons(addons: ValaxyAddons, userRoot = process.cwd()) {
  const resolvers: Record<string, ValaxyAddonResolver > = {}
  const mergeResolver = (resolver?: ValaxyAddonResolver) => {
    if (resolver)
      resolvers[resolver.name] = defu(resolvers[resolver.name] || {}, resolver)
  }
  if (Array.isArray(addons)) {
    for (const addon of addons) {
      if (typeof addon === 'string') {
        mergeResolver(await readAddonModule(addon, { cwd: userRoot }))
        continue
      }
      if (typeof addon === 'object')
        mergeResolver(defu(await readAddonModule(addon.name, { cwd: userRoot }), addon || {}))
    }
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
  const root = getAddonRoot(name, options.cwd || process.cwd())

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
  return resolver
}

/**
 * get addon root
 * @param name valaxy-addon-name
 * @param entry
 * @returns
 */
export function getAddonRoot(name: string, entry?: string) {
  const addonModule = (name.startsWith('valaxy-addon') || name.startsWith('.')) ? name : `valaxy-addon-${name}`
  return getModuleRoot(addonModule, entry)
}
