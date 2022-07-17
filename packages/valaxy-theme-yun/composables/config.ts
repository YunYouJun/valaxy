import { computed } from 'vue'
import { useConfig } from 'valaxy'
import type { YunTheme } from '../types'

/**
 * getThemeConfig
 * @returns
 */
export function useThemeConfig<ThemeConfig = YunTheme.Config>() {
  const config = useConfig<ThemeConfig>()
  return computed(() => config!.value.themeConfig)
}
