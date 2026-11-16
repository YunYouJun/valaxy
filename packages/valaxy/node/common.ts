import type { ConfigEnv, InlineConfig } from 'vite'
import type { ResolvedValaxyOptions } from './types'
import { realpathSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { uniq } from '@antfu/utils'
import fs from 'fs-extra'
import { loadConfigFromFile, mergeConfig } from 'vite'
import { escapeHtml, sanitizeUrl, serializeInlineJsString } from '../shared'
import { foucGuardHtml } from './scripts/fouc-guard'
import { toAtFS } from './utils'

function normalizeConfigPath(file: string) {
  const abs = resolve(file)
  try {
    return realpathSync(abs)
  }
  catch {
    return abs
  }
}

const VITE_DEFAULT_CONFIG_FILES = [
  'vite.config.js',
  'vite.config.mjs',
  'vite.config.ts',
  'vite.config.cjs',
  'vite.config.mts',
  'vite.config.cts',
]

async function findRootViteConfig(root: string): Promise<string | undefined> {
  for (const filename of VITE_DEFAULT_CONFIG_FILES) {
    const candidate = join(root, filename)
    if (await fs.exists(candidate))
      return candidate
  }
}

/**
 * merge vite.config.* (theme & user, plus any required explicit config file)
 * @internal
 */
export async function mergeViteConfigs(
  { userRoot, themeRoot }: ResolvedValaxyOptions,
  command: 'serve' | 'build',
  mode: string = command === 'build' ? 'production' : 'development',
  extraFiles: string[] = [],
  isSsrBuild?: boolean,
  configLoader?: InlineConfig['configLoader'],
  logLevel?: InlineConfig['logLevel'],
  customLogger?: InlineConfig['customLogger'],
) {
  const configEnv: ConfigEnv = {
    mode,
    command,
    ...(isSsrBuild !== undefined ? { isSsrBuild } : {}),
  }

  let resolvedConfig: InlineConfig = {}
  const discoveredFiles = (await Promise.all(
    uniq([themeRoot, userRoot]).map(root => findRootViteConfig(root)),
  )).filter((file): file is string => Boolean(file))

  const seen = new Set<string>()
  const files = [...discoveredFiles, ...extraFiles].filter((file) => {
    const key = normalizeConfigPath(file)
    if (seen.has(key))
      return false
    seen.add(key)
    return true
  })

  // Explicit extraFiles must reject if missing rather than falling back silently.
  const viteConfigs = await Promise.all(
    files.map(file => loadConfigFromFile(configEnv, file, undefined, logLevel, customLogger, configLoader)),
  )

  for (const viteConfig of viteConfigs) {
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

  if (config.siteConfig.favicon) {
    const safeFavicon = sanitizeUrl(config.siteConfig.favicon, '', { allowDataImage: true })
    if (safeFavicon)
      head += `<link rel="icon" href="${escapeHtml(safeFavicon)}">`
  }

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

  /**
   * FOUC (Flash of Unstyled Content) guard.
   * @see ./scripts/fouc-guard.ts
   * @see build.foucGuard in ValaxyExtendConfig
   */
  const foucGuard = config.build?.foucGuard ?? {}
  const foucEnabled = foucGuard.enabled ?? true
  const foucMaxDuration = foucGuard.maxDuration ?? 5000

  if (foucEnabled)
    head += foucGuardHtml(foucMaxDuration)

  if (config.siteConfig.lang) {
    head += `
    <script>
    const locale = localStorage.getItem('valaxy-locale') || ${serializeInlineJsString(config.siteConfig.lang)};
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
    .replace('__ENTRY__', () => toAtFS(join(clientRoot, 'main.ts')))
    .replace('<!-- head -->', () => head)
    .replace('<!-- body -->', () => body)

  return main
}
