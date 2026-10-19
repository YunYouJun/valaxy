import type { ResolvedValaxyOptions } from '../types'
import { resolveLayoutsOptions, scanLayouts } from '../plugins/layouts'

/** Names of the layouts `virtual:generated-layouts` would register, without importing any components. */
export async function resolveContentLayouts(options: ResolvedValaxyOptions): Promise<Set<string>> {
  const layouts = await scanLayouts(resolveLayoutsOptions(options, options.config.layouts))
  return new Set(layouts.keys())
}
