import type { Options } from '../types'
import { defineValaxyAddon } from 'valaxy'
import pkg from '../package.json'

export const addonTemplate = defineValaxyAddon<Options>(options => ({
  name: pkg.name,
  enable: true,
  options,
}))
