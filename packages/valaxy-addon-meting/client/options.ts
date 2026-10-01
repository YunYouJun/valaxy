import type { MetingOptions } from '../types'
import { useAddonConfig } from 'valaxy'
import { computed } from 'vue'

/**
 * get addon config
 */
export function useAddonMeting() {
  const addon = useAddonConfig<MetingOptions['options']>('valaxy-addon-meting')
  return computed<MetingOptions>(() => {
    return addon.value ?? {}
  })
}
