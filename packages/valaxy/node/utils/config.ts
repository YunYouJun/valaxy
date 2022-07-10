import type { ResolvedValaxyOptions } from 'valaxy'
import type { ValaxyPluginOptions } from 'valaxy/node'
import type { InlineConfig } from 'vite'
import { mergeConfig as mergeViteConfig } from 'vite'

export async function getValaxyConfigured(options: ResolvedValaxyOptions, viteConfig: InlineConfig = {}) {
  const { default: ValaxyThemeConfig } = (await import(`valaxy-theme-${options.theme}`))
  let valaxyConfig = await ValaxyThemeConfig?.(options)

  if (!valaxyConfig)
    return {}

  // if theme exists vite config
  // inherited configuration
  if (valaxyConfig.vite)
    Object.assign(viteConfig, mergeViteConfig(viteConfig, valaxyConfig.vite))

  valaxyConfig = mergeConfig(valaxyConfig, viteConfig.valaxy || {})

  return valaxyConfig as ValaxyPluginOptions
}

export function mergeConfig(merged: any, b: any) {
  for (const key in b) {
    const value = b[key]
    if (value == null)
      continue
    const existing = merged[key]
    if (Array.isArray(existing) && Array.isArray(value))
      merged[key] = [...existing, ...value]
    if (typeof existing === 'object' && typeof value === 'object') {
      merged[key] = mergeConfig(existing, value)
      continue
    }
    if (typeof existing === 'function' && typeof value === 'function') {
      merged[key] = function (...args: any[]) {
        existing.call(merged[key], ...args)
        value.call(merged[key], ...args)
      }
    }
    merged[key] = value
  }
  return merged
}
