import { computed } from 'vue'
import { useBlogConfig } from 'valaxy'
import type { ThemeConfig } from '../types'

/**
 * getThemeConfig
 * @returns
 */
export function useThemeConfig<T = ThemeConfig>() {
  const config = useBlogConfig<T>()
  return computed(() => config!.value.themeConfig)
}
