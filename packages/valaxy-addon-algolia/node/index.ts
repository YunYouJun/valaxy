import { defineValaxyAddon } from 'valaxy'
import type { AlgoliaSearchOptions } from '../types'
import pkg from '../package.json'

export const addonAlgolia = defineValaxyAddon<AlgoliaSearchOptions>(options => ({
  name: pkg.name,
  enable: true,
  options,
}))
