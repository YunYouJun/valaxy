import { resolve } from 'node:path'
import process from 'node:process'
import fs from 'fs-extra'
import defu from 'defu'
import { cyan, dim, yellow } from 'kolorist'
import ora from 'ora'
import type { ValaxyAddonResolver, ValaxyAddons } from '../types'
import { logger } from '../logger'
import { getModuleRoot } from './root'

export interface ReadAddonModuleOptions {
  cwd?: string
}

export async function parseAddons(addons: ValaxyAddons, userRoot = process.cwd()) {
  const spinner = ora(`Resolve ${cyan('addons')} from ${dim(userRoot)}`).start()

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

  spinner.succeed()
  const resolvedAddons = Object.values(resolvers).filter(item => item.enable)
  resolvedAddons.forEach((addon, i) => {
    logger.log(`  ${i === resolvedAddons.length - 1 ? '└─' : '├─'} ${yellow(addon.name)}${addon.global ? cyan(' (global)') : ''} ${dim(addon.pkg.homepage || addon.pkg.repository)}`)
  })
  return resolvedAddons
}

/**
 * read module from addon name
 * @internal
 * @param name
 * @param options
 */
export async function readAddonModule(name: string, options: ReadAddonModuleOptions = {}) {
  const root = getAddonRoot(name, options.cwd || process.cwd())

  const packageJSONPath = resolve(root, './package.json')
  if (!fs.existsSync(packageJSONPath)) {
    logger.error(`No addon named ${name} found`)
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
    pkg: packageJSON,
  }
  return resolver
}

/**
 * get addon root
 * @param name valaxy-addon-name
 * @param entry
 */
export function getAddonRoot(name: string, entry?: string) {
  const addonModule = (name.startsWith('valaxy-addon') || name.startsWith('.')) ? name : `valaxy-addon-${name}`
  return getModuleRoot(addonModule, entry)
}
