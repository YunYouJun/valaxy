import type { InlineConfig } from 'vite'
import { mergeConfig, build as viteBuild } from 'vite'
import type { ResolvedValaxyOptions } from './options'
import { createViteConfig } from './vite'

export async function build(
  options: ResolvedValaxyOptions,
  viteConfig: InlineConfig = {},
) {
  const inlineConfig = mergeConfig(viteConfig, createViteConfig(options))
  await viteBuild(inlineConfig)
}
