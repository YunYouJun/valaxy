import { defineValaxyAddon } from 'valaxy'
import type { AlgoliaSearchOptions } from '../types'

export const name = 'valaxy-addon-algolia'

export const addonAlgolia = defineValaxyAddon<AlgoliaSearchOptions>(options => ({
  name,
  enable: true,
  options,
}))
