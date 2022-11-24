import { computed } from 'vue'
import type { ValaxyAddon } from 'valaxy'
import { useConfig } from 'valaxy'
import type { WalineOptions } from '../types'

/**
 * get addon config
 * @returns
 */
export function useAddonWaline() {
  const config = useConfig()
  return computed(() => config.value.runtime.addons['valaxy-addon-waline'] as ValaxyAddon<WalineOptions>)
}
