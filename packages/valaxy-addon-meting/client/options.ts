import { computed } from 'vue'
import { useRuntimeConfig } from 'valaxy'
import type { MetingOptions } from '../node/index'

/**
 * get addon config
 */
export function useAddonMeting() {
  const runtimeConfig = useRuntimeConfig()
  return computed<MetingOptions>(() => {
    return runtimeConfig.value.addons['valaxy-addon-meting'] as unknown as MetingOptions
  })
}
