import type { InlineConfig } from 'vite'
import type { ResolvedValaxyOptions, ValaxyNode } from './types'
import { join } from 'node:path'
import { consola } from 'consola'
import fs from 'fs-extra'
import { mergeConfig as mergeViteConfig, build as viteBuild } from 'vite'
import { defaultViteConfig } from './constants'
import { ViteValaxyPlugins } from './plugins/preset'
import { resolveBuildPaths, resolveEffectiveViteConfig } from './utils/buildConfig'
import { collectRedirects, writeRedirectFiles } from './utils/clientRedirects'

// Re-export the built-in Valaxy SSG engine
export { ssgBuild } from './build/ssg'

export async function build(
  valaxyApp: ValaxyNode,
  viteConfig: InlineConfig = defaultViteConfig,
) {
  const { viteConfig: resolvedViteConfig } = await resolveEffectiveViteConfig(
    valaxyApp.options,
    'build',
    viteConfig,
    undefined,
    false,
  )
  const inlineConfig = mergeViteConfig(
    mergeViteConfig(defaultViteConfig, resolvedViteConfig),
    { plugins: await ViteValaxyPlugins(valaxyApp, {}, resolvedViteConfig) },
  )

  await viteBuild(inlineConfig)
}

/**
 * Shared post-processing after the SSG build.
 */
export async function postProcessForSSG(options: ResolvedValaxyOptions) {
  if (!options.config.siteConfig.redirects?.useVueRouter)
    await generateClientRedirects(options)
}

export async function generateClientRedirects(options: ResolvedValaxyOptions) {
  consola.info('generate client redirects...')
  const { outDir: outputPath } = resolveBuildPaths(options)
  const redirectRules = collectRedirects(options.redirects)

  const task = redirectRules.map(async (rule) => {
    const fromPath = join(outputPath, `${rule.from}.html`)
    const toPath = join(outputPath, `${rule.to}.html`)
    const routeExist = await fs.pathExists(toPath)
    if (!routeExist)
      throw new Error(`the route of '${rule.to}' not exists`)
    await writeRedirectFiles(rule.to, fromPath)
  })

  await Promise.all(task)
}
