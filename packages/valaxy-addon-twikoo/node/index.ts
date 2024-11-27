import type { TwikooOptions } from '../types'
import { defineValaxyAddon } from 'valaxy'

export const name = 'valaxy-addon-twikoo'
export const addonTwikoo = defineValaxyAddon<TwikooOptions>(options => ({
  name,
  enable: true,
  options,
}))
