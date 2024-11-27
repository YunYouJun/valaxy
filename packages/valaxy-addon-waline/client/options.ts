import type { ValaxyAddon } from 'valaxy'
import type { WalineOptions } from '../types'
import { useRuntimeConfig } from 'valaxy'
import { computed } from 'vue'

/**
 * get addon config
 */
export function useAddonWaline() {
  const runtimeConfig = useRuntimeConfig()
  return computed(() => runtimeConfig.value.addons['valaxy-addon-waline'] as ValaxyAddon<WalineOptions>)
}
