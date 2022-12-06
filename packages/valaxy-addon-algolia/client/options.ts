import { computed } from 'vue'
import type { ValaxyAddon } from 'valaxy'
import { useConfig } from 'valaxy'
import type { AlgoliaSearchOptions } from '../types'
import pkg from '../package.json'

/**
 * get addon config
 * @returns
 */
export function useAddonAlgolia() {
  const config = useConfig()
  return computed(() => config.value.runtime.addons[pkg.name] as ValaxyAddon<AlgoliaSearchOptions>)
}
