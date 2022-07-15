import { computed } from 'vue'
import { useSiteConfig } from 'valaxy'
import type { YunTheme } from '../types'

/**
 * getThemeConfig
 * @returns
 */
export function useThemeConfig<ThemeConfig = YunTheme.Config>() {
  const config = useSiteConfig<ThemeConfig>()
  return computed(() => config!.value.themeConfig)
}
