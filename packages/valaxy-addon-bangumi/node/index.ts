import { defineValaxyAddon } from 'valaxy'
import pkg from '../package.json'
import type { BangumiOptions } from '../types'

export const addonBangumi = defineValaxyAddon<BangumiOptions>(options => ({
  name: pkg.name,
  enable: true,
  options,
}))
