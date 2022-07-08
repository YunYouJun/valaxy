import type { UserConfig } from '../types'

export * from './config'

export * from './composables'
export * from './utils'

export * from './setups'

// shim
/**
 * Type config helper
 */
export function defineConfig<ThemeConfig>(config: UserConfig<ThemeConfig>) {
  return config
}
