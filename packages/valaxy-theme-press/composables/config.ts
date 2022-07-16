import { computed } from 'vue'
import { useSite } from 'valaxy'
import type { ThemeConfig } from '../types'

/**
 * getThemeConfig
 * @returns
 */
export function useThemeConfig<T = ThemeConfig>() {
  const config = useSite<T>()
  return computed(() => config!.value.themeConfig)
}
