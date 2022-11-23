import type { ValaxyAddonLike } from 'valaxy'
import type { WalineOptions } from '../types'

// todo
// defineValaxyAddon
export function addonWaline(options: WalineOptions) {
  return ['valaxy-addon-waline', {
    enable: true,
    options,
  }] as [string, ValaxyAddonLike]
}
