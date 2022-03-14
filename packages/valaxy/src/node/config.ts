import { loadConfig } from 'c12'
import type { UserConfig } from '../types'

export async function resolveConfig() {
  const { config } = await loadConfig<UserConfig>({ name: 'valaxy' })
}

resolveConfig()
