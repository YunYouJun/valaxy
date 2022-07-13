import { existsSync, promises as fs } from 'fs'
import { join } from 'path'
import type { ConfigEnv, InlineConfig } from 'vite'
import { uniq } from '@antfu/utils'
import { loadConfigFromFile, mergeConfig } from 'vite'
import type { ResolvedValaxyOptions } from './options'
import { toAtFS } from './utils'

export async function mergeViteConfigs({ userRoot, themeRoot }: ResolvedValaxyOptions, command: 'serve' | 'build') {
  const configEnv: ConfigEnv = {
    mode: 'development',
    command,
  }

  let resolvedConfig: InlineConfig = {}

  // let vite default config file be clientRoot/vite.config.ts
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

export async function getIndexHtml({ clientRoot, themeRoot, userRoot, config }: ResolvedValaxyOptions): Promise<string> {
  let main = await fs.readFile(join(clientRoot, 'index.html'), 'utf-8')
  let head = ''
  let body = ''

  const roots = [themeRoot, userRoot]

  if (config.mode === 'auto') {
    head += `
  <script>
  (function () {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const setting = localStorage.getItem('vueuse-color-scheme') || 'auto'
    if (setting === 'dark' || (prefersDark && setting !== 'light'))
      document.documentElement.classList.toggle('dark', true)
  })()
  </script>
    `
  }

  for (const root of roots) {
    const path = join(root, 'index.html')
    if (!existsSync(path))
      continue

    const indexHtml = await fs.readFile(path, 'utf-8')

    head += `\n${(indexHtml.match(/<head>([\s\S]*?)<\/head>/im)?.[1] || '').trim()}`
    body += `\n${(indexHtml.match(/<body>([\s\S]*?)<\/body>/im)?.[1] || '').trim()}`
  }

  main = main
    .replace('__ENTRY__', toAtFS(join(clientRoot, 'main.ts')))
    .replace('<!-- head -->', head)
    .replace('<!-- body -->', body)

  return main
}
