import type { WalineOptions } from '../types'
import { useAddonConfig } from 'valaxy'

/**
 * get addon config
 */
export function useAddonWaline() {
  return useAddonConfig<WalineOptions>('valaxy-addon-waline')
}
