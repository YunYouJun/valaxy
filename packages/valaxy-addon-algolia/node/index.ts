import { defineValaxyAddon } from 'valaxy'
import type { AlgoliaSearchOptions } from '../types'

export const addonAlgolia = defineValaxyAddon<AlgoliaSearchOptions>(options => ({
  name: 'valaxy-addon-algolia',
  enable: true,
  options,
}))
