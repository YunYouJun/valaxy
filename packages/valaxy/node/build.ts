import type { InlineConfig } from 'vite'
import { mergeConfig, build as viteBuild } from 'vite'
import { build as viteSsgBuild } from 'vite-ssg/node'
import generateSitemap from 'vite-ssg-sitemap'

import type { ResolvedValaxyOptions } from './options'
import { ViteValaxyPlugins } from './plugins/preset'
import { resolveBlogConfig } from './utils/config'

export async function build(
  options: ResolvedValaxyOptions,
  viteConfig: InlineConfig = {},
) {
  const blogConfig = await resolveBlogConfig(options, viteConfig)

  const inlineConfig = mergeConfig({
    plugins: await ViteValaxyPlugins(options, blogConfig),
  }, viteConfig)

  await viteBuild(inlineConfig)
}

export async function ssgBuild(
  options: ResolvedValaxyOptions,
  viteConfig: InlineConfig = {},
) {
  const blogConfig = await resolveBlogConfig(options, viteConfig)

  const defaultConfig: InlineConfig = {
    plugins: await ViteValaxyPlugins(options, blogConfig),
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
  const inlineConfig: InlineConfig = mergeConfig(defaultConfig, viteConfig)

  await viteSsgBuild({}, inlineConfig)
}
