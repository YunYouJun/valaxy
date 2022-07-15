import { computed } from 'vue'
import { useSiteConfig } from 'valaxy'
import type { ThemeConfig } from '../types'

/**
 * getThemeConfig
 * @returns
 */
export function useThemeConfig<T = ThemeConfig>() {
  const config = useSiteConfig<T>()
  return computed(() => config!.value.themeConfig)
}
