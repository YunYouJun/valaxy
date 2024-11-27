import type { ValaxyAddon } from 'valaxy'
import type { TwikooOptions } from '../types'
import { useRuntimeConfig } from 'valaxy'
import { computed } from 'vue'

/**
 * get addon config
 */
export function useAddonTwikoo() {
  const runtimeConfig = useRuntimeConfig()
  return computed(() => runtimeConfig.value.addons['valaxy-addon-twikoo'] as ValaxyAddon<TwikooOptions>)
}
