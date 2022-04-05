import type { InlineConfig } from 'vite'
import { mergeConfig, build as viteBuild } from 'vite'
import { build as viteSsgBuild } from 'vite-ssg/node'
import generateSitemap from 'vite-ssg-sitemap'
import type { ResolvedValaxyOptions } from './options'
import { createViteConfig } from './vite'

export async function build(
  options: ResolvedValaxyOptions,
  viteConfig: InlineConfig = {},
) {
  const inlineConfig = mergeConfig(createViteConfig(options), viteConfig)
  await viteBuild(inlineConfig)
}

export async function ssgBuild(
  options: ResolvedValaxyOptions,
  viteConfig: InlineConfig = {},
) {
  const inlineConfig: InlineConfig = mergeConfig(createViteConfig(options, {}), viteConfig)

  // https://github.com/antfu/vite-ssg
  inlineConfig.ssgOptions = {
    script: 'async',
    formatting: 'minify',
    onFinished() { generateSitemap() },
  }

  await viteSsgBuild({}, inlineConfig)
}
