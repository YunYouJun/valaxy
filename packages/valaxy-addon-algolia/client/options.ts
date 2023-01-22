import { computed } from 'vue'
import type { ValaxyAddon } from 'valaxy'
import { useRuntimeConfig } from 'valaxy'
import type { AlgoliaSearchOptions } from '../types'
import pkg from '../package.json'

/**
 * get addon config
 * @returns
 */
export function useAddonAlgolia() {
  const runtimeConfig = useRuntimeConfig()
  return computed(() => runtimeConfig.value.addons[pkg.name] as ValaxyAddon<AlgoliaSearchOptions>)
}
