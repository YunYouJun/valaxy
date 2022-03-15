import { loadConfig } from 'c12'
import type { UserConfig } from '../types'

// for user config
export async function resolveConfig() {
  const { config } = await loadConfig<UserConfig>({ name: 'valaxy' })
}
