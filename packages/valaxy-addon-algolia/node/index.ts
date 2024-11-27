import type { AlgoliaSearchOptions } from '../types'
import { defineValaxyAddon } from 'valaxy'

export const name = 'valaxy-addon-algolia'

export const addonAlgolia = defineValaxyAddon<AlgoliaSearchOptions>(options => ({
  name,
  enable: true,
  options,
}))
