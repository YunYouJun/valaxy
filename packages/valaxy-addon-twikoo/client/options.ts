import type { TwikooOptions } from '../types'
import { useAddonConfig } from 'valaxy'

/**
 * get addon config
 */
export function useAddonTwikoo() {
  return useAddonConfig<TwikooOptions>('valaxy-addon-twikoo')
}
