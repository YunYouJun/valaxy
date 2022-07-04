import type { YunTheme } from 'valaxy-theme-yun'
import type { UserConfig } from '../types'

export const EXTERNAL_URL_RE = /^https?:/i

/**
 * Type config helper
 */
export function defineConfig(config: UserConfig<YunTheme.Config>) {
  return config
}

/**
 * Type config helper for custom theme config
 */
export function defineConfigWithTheme<ThemeConfig>(
  config: UserConfig<ThemeConfig>,
) {
  return config
}
