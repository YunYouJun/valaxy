import type { ConfigEnv, InlineConfig } from 'vite'
import type { ResolvedValaxyOptions } from './options'
import { join } from 'node:path'
import { uniq } from '@antfu/utils'
import fs from 'fs-extra'
import { loadConfigFromFile, mergeConfig } from 'vite'
import { toAtFS } from './utils'

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
export async function getIndexHtml({ clientRoot, themeRoot, userRoot, config }: ResolvedValaxyOptions, rawHtml: string): Promise<string> {
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
    ;(function () {
      const prefersDark =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      const setting = localStorage.getItem('vueuse-color-scheme') || 'auto'
      if (setting === 'dark' || (prefersDark && setting !== 'light'))
        document.documentElement.classList.toggle('dark', true)
    })()
    </script>
  `

    // add it for first load
    head += `<style type="text/css">
    :root { color-scheme: light dark; --va-c-bg: #fff; }
    html.dark { --va-c-bg: #000; }
    html { background-color: var(--va-c-bg); }
  </style>`
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

    head += `\n${(indexHtml.match(/<head>([\s\S]*?)<\/head>/i)?.[1] || '').trim()}`
    body += `\n${(indexHtml.match(/<body>([\s\S]*?)<\/body>/i)?.[1] || '').trim()}`
  }

  main = main
    .replace('__ENTRY__', toAtFS(join(clientRoot, 'main.ts')))
    .replace('<!-- head -->', head)
    .replace('<!-- body -->', body)

  return main
}
