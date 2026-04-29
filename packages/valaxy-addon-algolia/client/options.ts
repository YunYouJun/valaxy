import type { AlgoliaSearchOptions } from '../types'
import { useAddonConfig } from 'valaxy'
import pkg from '../package.json'

/**
 * get addon config
 */
export function useAddonAlgoliaConfig() {
  return useAddonConfig<AlgoliaSearchOptions>(pkg.name)
}
