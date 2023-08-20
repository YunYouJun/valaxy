import { defineValaxyAddon } from 'valaxy'
import type { TwikooOptions } from '../types'

export const name = 'valaxy-addon-twikoo'
export const addonTwikoo = defineValaxyAddon<TwikooOptions>(options => ({
  name,
  enable: true,
  options,
}))
