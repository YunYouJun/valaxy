import { computed } from 'vue'
import { useConfig } from 'valaxy'
import type { WalineOptions } from '../types'

export function useWalineOptions() {
  const config = useConfig()
  return computed(() => config.value.runtime.addons['valaxy-addon-waline'].options as WalineOptions)
}
