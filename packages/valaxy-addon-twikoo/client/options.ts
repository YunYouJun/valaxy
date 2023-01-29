import { computed } from 'vue'
import type { ValaxyAddon } from 'valaxy'
import { useRuntimeConfig } from 'valaxy'
import type { TwikooOptions } from '../types'

/**
 * get addon config
 * @returns
 */
export function useAddonTwikoo() {
  const runtimeConfig = useRuntimeConfig()
  return computed(() => runtimeConfig.value.addons['valaxy-addon-twikoo'] as ValaxyAddon<TwikooOptions>)
}
