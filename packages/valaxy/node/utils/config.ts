import type { ResolvedValaxyOptions } from 'valaxy'
import type { ValaxyPluginOptions } from 'valaxy/node'
import type { InlineConfig } from 'vite'
import { mergeConfig as mergeViteConfig } from 'vite'

export async function resolveValaxyConfig(options: ResolvedValaxyOptions, viteConfig: InlineConfig = {}) {
  const { default: config } = (await import(`valaxy-theme-${options.theme}`))
  let resolved = typeof config === 'function' ? (await config?.(options)) : config

  if (!resolved)
    return {}

  // if theme exists vite config
  // inherited configuration
  if (resolved.vite)
    Object.assign(viteConfig, mergeViteConfig(viteConfig, resolved.vite))

  if (viteConfig.valaxy)
    resolved = mergeConfig(resolved, viteConfig.valaxy)

  return resolved as ValaxyPluginOptions
}

export function mergeConfig(merged: any, b: any) {
  for (const key in b) {
    const value = b[key]
    if (value == null)
      continue
    const existing = merged[key]
    if (Array.isArray(existing) && Array.isArray(value)) {
      merged[key] = [...existing, ...value]
      continue
    }
    if (typeof existing === 'object' && typeof value === 'object') {
      merged[key] = mergeConfig(existing, value)
      continue
    }
    if (typeof existing === 'function' && typeof value === 'function') {
      merged[key] = function (...args: any[]) {
        existing.call(merged[key], ...args)
        value.call(merged[key], ...args)
      }
      continue
    }
    merged[key] = value
  }
  return merged
}
