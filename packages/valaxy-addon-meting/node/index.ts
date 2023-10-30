import { defineValaxyAddon } from 'valaxy'
import pkg from '../package.json'

export interface MetingOptions {
  global: boolean
}

export const addonMeting = defineValaxyAddon<MetingOptions>(options => ({
  name: pkg.name,
  enable: true,
  global: options?.global ?? false,
  options,
}))
