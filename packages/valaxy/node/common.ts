import { join } from 'node:path'
import fs from 'fs-extra'
import type { ConfigEnv, InlineConfig } from 'vite'
import { uniq } from '@antfu/utils'
import { loadConfigFromFile, mergeConfig } from 'vite'
import type { ResolvedValaxyOptions } from './options'

/**
 * merge vite.config.ts (user & theme)
 * @internal
 */
export async function mergeViteConfigs({ userRoot, themeRoot }: ResolvedValaxyOptions, command: 'serve' | 'build') {
  const configEnv: ConfigEnv = {
    mode: 'development',
    command,
  }

  let resolvedConfig: InlineConfig = {}

  // let vite default config file be clientRoot/vite.config.ts
  const files = uniq([themeRoot, userRoot]).map(i => join(i, 'vite.config.ts'))

  for await (const file of files) {
    if (!fs.existsSync(file))
      continue
    const viteConfig = await loadConfigFromFile(configEnv, file)
    if (!viteConfig?.config)
      continue
    resolvedConfig = mergeConfig(resolvedConfig, viteConfig.config)
  }

  return resolvedConfig
}

/**
 * generate index.html from user/theme/client
 * @internal
 */
export async function getIndexHtml({ themeRoot, userRoot, config }: ResolvedValaxyOptions, rawHtml: string): Promise<string> {
  // get from template
  // use client index.html directly, than change it in transformIndexHtml

  // let main = await fs.readFile(indexTemplatePath, 'utf-8')
  let main = rawHtml
  let head = ''
  let body = ''

  if (config.siteConfig.favicon)
    head += `<link rel="icon" href="${config.siteConfig.favicon}">`

  const roots = [userRoot, themeRoot]

  if (config.siteConfig.mode === 'auto') {
    head += `
    <script>
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const colorSchemeSetting = localStorage.getItem('vueuse-color-scheme') || 'auto';
    if (colorSchemeSetting === 'dark' || (prefersDark && colorSchemeSetting !== 'light')) {
      document.documentElement.classList.toggle('dark', true);
    }
    </script>
  `
  }

  if (config.siteConfig.lang) {
    head += `
    <script>
    const locale = localStorage.getItem('valaxy-locale') || '${config.siteConfig.lang}';
    document.documentElement.setAttribute('lang', locale);
    </script>
    `
  }

  for (const root of roots) {
    const path = join(root, 'index.html')
    if (!fs.existsSync(path))
      continue

    const indexHtml = await fs.readFile(path, 'utf-8')

    head += `\n${(indexHtml.match(/<head>([\s\S]*?)<\/head>/im)?.[1] || '').trim()}`
    body += `\n${(indexHtml.match(/<body>([\s\S]*?)<\/body>/im)?.[1] || '').trim()}`
  }

  main = main
    .replace('<!-- head -->', head)
    .replace('<!-- body -->', body)

  return main
}
