import { existsSync } from 'fs'
import { join } from 'path'
import type { ConfigEnv, InlineConfig } from 'vite'
import { uniq } from '@antfu/utils'
import { loadConfigFromFile, mergeConfig } from 'vite'
import type { ResolvedValaxyOptions } from './options'

export async function mergeViteConfigs({ userRoot, themeRoot }: ResolvedValaxyOptions, viteConfig: InlineConfig, config: InlineConfig, command: 'serve' | 'build') {
  const configEnv: ConfigEnv = {
    mode: 'development',
    command,
  }

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
    config = mergeConfig(config, viteConfig.config)
  }

  const resolvedConfig = mergeConfig(viteConfig, config)
  return resolvedConfig
}
