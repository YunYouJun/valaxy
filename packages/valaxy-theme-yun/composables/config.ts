import { computed } from 'vue'
import { useValaxyConfig } from 'valaxy'
import type { YunTheme } from '../types'

/**
 * getThemeConfig
 */
export function useThemeConfig<ThemeConfig = YunTheme.Config>() {
  const config = useValaxyConfig<ThemeConfig>()
  return computed(() => config!.value.themeConfig)
}
