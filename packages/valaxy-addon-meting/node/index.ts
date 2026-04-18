import type { MetingOptions } from '../types'
import { defineValaxyAddon } from 'valaxy'
import pkg from '../package.json'

export type { MetingOptions, MetingProps } from '../types'

export const addonMeting = defineValaxyAddon<MetingOptions>(options => ({
  name: pkg.name,
  enable: true,
  global: options?.global ?? false,
  ...options,
}))
