import type { WalineOptions } from '../types'
import { defineValaxyAddon } from 'valaxy'

export const addonWaline = defineValaxyAddon<WalineOptions>(options => ({
  name: 'valaxy-addon-waline',
  enable: true,
  options,
}))
