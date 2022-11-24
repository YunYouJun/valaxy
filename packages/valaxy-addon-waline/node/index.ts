import { defineValaxyAddon } from 'valaxy'
import type { WalineOptions } from '../types'

// todo
// defineValaxyAddon
// export function addonWaline(options: WalineOptions) {
//   return ['valaxy-addon-waline', {
//     enable: true,
//     options,
//   }] as [string, ValaxyAddonLike]
// }

export const addonWaline = defineValaxyAddon<WalineOptions>(options => ({
  name: 'valaxy-addon-waline',
  enable: true,
  options,
}))
