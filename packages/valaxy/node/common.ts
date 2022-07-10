import { existsSync } from 'fs'
import { join } from 'path'
import type { ConfigEnv, InlineConfig } from 'vite'
import { uniq } from '@antfu/utils'
import { loadConfigFromFile, mergeConfig } from 'vite'
import type { ResolvedValaxyOptions } from './options'

export async function mergeViteConfigs({ userRoot, themeRoot }: ResolvedValaxyOptions, command: 'serve' | 'build') {
  const configEnv: ConfigEnv = {
    mode: 'development',
    command,
  }

  let resolvedConfig: InlineConfig = {}

  const files = uniq([
    userRoot,
    themeRoot,
  ]).map(i => join(i, 'vite.config.ts'))

  for await (const file of files) {
    if (!existsSync(file))
      continue
    const viteConfig = await loadConfigFromFile(configEnv, file)
    if (!viteConfig?.config)
      continue
    resolvedConfig = mergeConfig(resolvedConfig, viteConfig.config)
  }

  return resolvedConfig
}
