import type { YunTheme } from '../types'
import { useValaxyConfig } from 'valaxy'
import { computed } from 'vue'

/**
 * getThemeConfig
 */
export function useThemeConfig<ThemeConfig = YunTheme.Config>() {
  const config = useValaxyConfig<ThemeConfig>()
  return computed(() => config!.value.themeConfig)
}
