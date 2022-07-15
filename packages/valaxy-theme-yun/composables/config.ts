import { computed } from 'vue'
import { useBlogConfig } from 'valaxy'
import type { YunTheme } from '../types'

/**
 * getThemeConfig
 * @returns
 */
export function useThemeConfig<ThemeConfig = YunTheme.Config>() {
  const config = useBlogConfig<ThemeConfig>()
  return computed(() => config!.value.themeConfig)
}
