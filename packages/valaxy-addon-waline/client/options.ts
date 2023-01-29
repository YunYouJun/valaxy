import { computed } from 'vue'
import type { ValaxyAddon } from 'valaxy'
import { useRuntimeConfig } from 'valaxy'
import type { WalineOptions } from '../types'

/**
 * get addon config
 * @returns
 */
export function useAddonWaline() {
  const runtimeConfig = useRuntimeConfig()
  return computed(() => runtimeConfig.value.addons['valaxy-addon-waline'] as ValaxyAddon<WalineOptions>)
}
