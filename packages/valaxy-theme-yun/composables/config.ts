import { computed } from 'vue'
import { useSite } from 'valaxy'
import type { YunTheme } from '../types'

/**
 * getThemeConfig
 * @returns
 */
export function useThemeConfig<ThemeConfig = YunTheme.Config>() {
  const config = useSite<ThemeConfig>()
  return computed(() => config!.value.themeConfig)
}
