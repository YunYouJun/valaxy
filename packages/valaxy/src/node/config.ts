import { loadConfig } from 'c12'
import { defaultValaxyConfig } from '../core'
import type { ValaxyConfig } from '../types'

// for user config
export async function resolveConfig() {
  const { config } = await loadConfig<ValaxyConfig>({ name: 'valaxy', defaults: defaultValaxyConfig })
  return config
}
