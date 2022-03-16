import { loadConfig } from 'c12'
import type { ValaxyConfig } from '../types'

// for user config
export async function resolveConfig() {
  const { config } = await loadConfig<ValaxyConfig>({
    name: 'valaxy',
    defaults: {
      theme: 'yun',
      themeConfig: {},
    },
  })
  return config
}
