import type { ValaxyAddon } from '../../types'
import type { ResolvedValaxyOptions, ValaxyAddonResolver, ValaxyNodeConfig } from '../types'
import path from 'node:path'
import fs from 'fs-extra'
import { mergeValaxyConfig, resolveValaxyConfigFromRoot } from './valaxy'

export function defineValaxyAddon<AddonOptions = object>(
  addonFunc: (addonOptions?: AddonOptions, valaxyOptions?: ResolvedValaxyOptions) => ValaxyAddon & {
    setup?: ValaxyAddonResolver['setup']
  },
) {
  return addonFunc
}
export const defineAddon = defineValaxyAddon

export async function resolveAddonsConfig(addons: ValaxyAddonResolver[], options: ResolvedValaxyOptions) {
  let valaxyConfig: ValaxyNodeConfig = {} as ValaxyNodeConfig

  // Resolve all addon configs in parallel for faster startup
  const results = await Promise.all(
    addons.map(async (addon) => {
      const addonConfigPath = path.resolve(addon.root, 'valaxy.config.ts')
      if (!await fs.exists(addonConfigPath))
        return null

      const { config, configFile } = await resolveValaxyConfigFromRoot(addon.root, options)
      if (!config)
        return null

      return { addon, config, configFile }
    }),
  )

  // Merge sequentially to preserve deterministic order
  for (const result of results) {
    if (!result)
      continue
    result.addon.configFile = result.configFile
    valaxyConfig = mergeValaxyConfig(result.config, valaxyConfig)
  }

  return valaxyConfig
}
