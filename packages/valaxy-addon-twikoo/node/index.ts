import { defineValaxyAddon } from 'valaxy'
import type { TwikooOptions } from '../types'

export const addonTwikoo = defineValaxyAddon<TwikooOptions>(options => ({
  name: 'valaxy-addon-twikoo',
  enable: true,
  options,
}))
