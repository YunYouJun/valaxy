import type { InlineConfig } from 'vite'
import { mergeConfig as mergeViteConfig, build as viteBuild } from 'vite'
import { build as viteSsgBuild } from 'vite-ssg/node'
import generateSitemap from 'vite-ssg-sitemap'

import type { ResolvedValaxyOptions } from './options'
import { ViteValaxyPlugins } from './plugins/preset'

export async function build(
  options: ResolvedValaxyOptions,
  viteConfig: InlineConfig = {},
) {
  const inlineConfig = mergeViteConfig(viteConfig, {
    plugins: await ViteValaxyPlugins(options),
  })

  await viteBuild(inlineConfig)
}

export async function ssgBuild(
  options: ResolvedValaxyOptions,
  viteConfig: InlineConfig = {},
) {
  const defaultConfig: InlineConfig = {
    plugins: await ViteValaxyPlugins(options),
  }

  defaultConfig.ssgOptions = {
    script: 'async',
    formatting: 'minify',
    onFinished() {
      generateSitemap(
        {
          hostname: options.config.url,
        },
      )
    },
    dirStyle: 'nested',
  }
  const inlineConfig: InlineConfig = mergeViteConfig(defaultConfig, viteConfig)

  await viteSsgBuild({}, inlineConfig)
}
