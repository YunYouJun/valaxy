import { defineValaxyAddon } from 'valaxy'
import pkg from '../package.json'

export const addonBangumi = defineValaxyAddon(options => ({
  name: pkg.name,
  enable: true,
  options,
}))
