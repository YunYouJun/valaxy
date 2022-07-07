import type { UserConfig } from '../types'

export const EXTERNAL_URL_RE = /^https?:/i

// type ThemeConfig = Record<string, any>

/**
 * Type config helper
 */
export function defineConfig<ThemeConfig>(config: UserConfig<ThemeConfig>) {
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
