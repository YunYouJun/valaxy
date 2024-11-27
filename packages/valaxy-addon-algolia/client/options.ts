import type { ValaxyAddon } from 'valaxy'
import type { AlgoliaSearchOptions } from '../types'
import { useRuntimeConfig } from 'valaxy'
import { computed } from 'vue'
import pkg from '../package.json'

/**
 * get addon config
 */
export function useAddonAlgoliaConfig() {
  const runtimeConfig = useRuntimeConfig()
  return computed(() => runtimeConfig.value.addons[pkg.name] as ValaxyAddon<AlgoliaSearchOptions>)
}
