import { defineValaxyAddon } from 'valaxy'
import type { WalineOptions } from '../types'

export const addonWaline = defineValaxyAddon<WalineOptions>(options => ({
  name: 'valaxy-addon-waline',
  enable: true,
  options,
}))
