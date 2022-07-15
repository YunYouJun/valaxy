import type { InlineConfig } from 'vite'
import { mergeConfig, build as viteBuild } from 'vite'
import { build as viteSsgBuild } from 'vite-ssg/node'
import generateSitemap from 'vite-ssg-sitemap'

import type { ResolvedValaxyOptions } from './options'
import { ViteValaxyPlugins } from './plugins/preset'
import { resolveValaxyConfig } from './utils/config'

export async function build(
  options: ResolvedValaxyOptions,
  viteConfig: InlineConfig = {},
) {
  const config = await resolveValaxyConfig(options, viteConfig)

  const inlineConfig = mergeConfig({
    plugins: await ViteValaxyPlugins(options, config),
  }, viteConfig)

  await viteBuild(inlineConfig)
}

export async function ssgBuild(
  options: ResolvedValaxyOptions,
  viteConfig: InlineConfig = {},
) {
  const config = await resolveValaxyConfig(options, viteConfig)

  const defaultConfig: InlineConfig = {
    plugins: await ViteValaxyPlugins(options, config),
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
