import type { YunTheme } from 'valaxy-theme-yun'
import { ensurePrefix } from '@antfu/utils'

/**
 * Get the `Sidebar` from sidebar option. This method will ensure to get correct
 * sidebar config from `MultiSideBarConfig` with various path combinations such
 * as matching `guide/` and `/guide/`. If no matching config was found, it will
 * return empty array.
 */
export function getSidebar(
  sidebar: YunTheme.Sidebar,
  path: string,
) {
  if (Array.isArray(sidebar))
    return sidebar

  path = ensurePrefix('/', path)

  for (const dir in sidebar) {
    // make sure the multi sidebar key starts with slash too
    if (path.startsWith(ensurePrefix('/', dir)))
      return sidebar[dir]
  }

  return []
}
