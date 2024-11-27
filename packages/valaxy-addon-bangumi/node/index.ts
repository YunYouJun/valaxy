import type { BangumiOptions } from '../types'
import { defineValaxyAddon } from 'valaxy'
import pkg from '../package.json'

export const addonBangumi = defineValaxyAddon<BangumiOptions>(options => ({
  name: pkg.name,
  enable: true,
  options,
}))
