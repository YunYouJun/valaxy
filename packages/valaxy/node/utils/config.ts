import type { InlineConfig } from 'vite'
import { mergeConfig as mergeViteConfig } from 'vite'
import type { ResolvedValaxyOptions } from '../options'
import { mergeValaxyConfigs } from '../common'

export async function resolveValaxyConfig(options: ResolvedValaxyOptions, viteConfig: InlineConfig = {}) {
  const resolved = await mergeValaxyConfigs(options)

  if (!resolved.vite)
    resolved.vite = {}

  resolved.vite = mergeViteConfig(resolved.vite, viteConfig)

  return resolved
}
