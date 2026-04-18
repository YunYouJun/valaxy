import type { MetingOptions } from '../types'
import { useRuntimeConfig } from 'valaxy'
import { computed } from 'vue'

/**
 * get addon config
 */
export function useAddonMeting() {
  const runtimeConfig = useRuntimeConfig()
  return computed<MetingOptions>(() => {
    return runtimeConfig.value.addons['valaxy-addon-meting'] as unknown as MetingOptions
  })
}
