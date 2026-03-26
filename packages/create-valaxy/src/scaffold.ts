/**
 * Pure functions for scaffolding theme selection in create-valaxy.
 * Extracted for testability.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const THEME_PREFIX = 'valaxy-theme-'

const THEME_NAME_RE = /^[a-z\d\-_]+$/

const __filename = fileURLToPath(import.meta.url)

/**
 * Resolve the path to a theme-specific template directory.
 * Validates the theme name to prevent path traversal.
 */
export function getThemeTemplatePath(theme: string): string {
  if (!THEME_NAME_RE.test(theme))
    throw new Error(`Invalid theme name: "${theme}"`)
  return path.resolve(__filename, '../..', `template-blog-${theme}`)
}

/**
 * Check whether a theme-specific template directory exists.
 *
 * If the theme name is invalid (fails validation in getThemeTemplatePath),
 * this function returns false instead of throwing, so callers can fall back
 * to generic behavior without crashing.
 */
export function hasThemeTemplate(theme: string): boolean {
  try {
    return fs.existsSync(getThemeTemplatePath(theme))
  }
  catch {
    return false
  }
}

/**
 * Normalize a raw theme name: trim whitespace and strip `valaxy-theme-` prefix.
 */
export function normalizeThemeName(raw: string): string {
  const trimmed = raw.trim()
  return trimmed.startsWith(THEME_PREFIX)
    ? trimmed.slice(THEME_PREFIX.length)
    : trimmed
}

/**
 * Replace the theme dependency in a package.json object.
 * Returns a new object — the original is not mutated.
 *
 * - If selectedTheme is 'yun', the pkg is returned as-is (shallow clone).
 * - Otherwise, `valaxy-theme-yun` is removed and `valaxy-theme-<selectedTheme>` is added with version `'latest'`.
 */
export function replaceThemeDeps(
  pkg: Record<string, any>,
  selectedTheme: string,
): Record<string, any> {
  const result = { ...pkg, dependencies: { ...pkg.dependencies } }

  if (selectedTheme === 'yun')
    return result

  if (result.dependencies?.['valaxy-theme-yun']) {
    delete result.dependencies['valaxy-theme-yun']
  }
  result.dependencies[`valaxy-theme-${selectedTheme}`] = 'latest'

  return result
}

/**
 * Replace theme references in a valaxy.config.ts content string.
 *
 * - If selectedTheme is 'yun', the content is returned unchanged.
 * - Otherwise performs 4 replacements:
 *   1. Comment out the UserThemeConfig import (pointing to new theme package)
 *   2. Replace `theme: 'yun'` → `theme: '<selectedTheme>'`
 *   3. Remove the generic type parameter `<UserThemeConfig>`
 *   4. Clear themeConfig object contents
 */
export function replaceThemeInConfig(
  configContent: string,
  selectedTheme: string,
): string {
  if (selectedTheme === 'yun')
    return configContent

  let result = configContent

  // 1. Comment out import type
  result = result.replace(
    `import type { UserThemeConfig } from 'valaxy-theme-yun'`,
    `// import type { UserThemeConfig } from 'valaxy-theme-${selectedTheme}'`,
  )
  // 2. Replace theme name
  result = result.replace(
    `theme: 'yun'`,
    `theme: '${selectedTheme}'`,
  )
  // 3. Remove generic type parameter
  result = result.replace(
    `defineValaxyConfig<UserThemeConfig>`,
    `defineValaxyConfig`,
  )
  // 4. Clear themeConfig
  result = result.replace(
    /themeConfig: \{[\s\S]*?\n {2}\},/,
    `themeConfig: {},`,
  )

  return result
}
