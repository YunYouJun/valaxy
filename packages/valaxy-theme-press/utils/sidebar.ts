import type { PressTheme } from '../types'

export interface SidebarGroup extends Omit<PressTheme.SidebarItem, 'items'> {
  items: PressTheme.SidebarEntry[]
}

/**
 * Resolve the sidebar for the current path.
 *
 * This follows VitePress' default theme behavior: arrays are used as-is,
 * multi-sidebars use the longest matching path prefix, and object entries can
 * provide a shared `base` for child links.
 */
export function getSidebar(sidebar: PressTheme.Sidebar | undefined, path: string): PressTheme.SidebarEntry[] {
  if (Array.isArray(sidebar))
    return addBase(sidebar)

  if (!sidebar)
    return []

  const normalizedPath = ensureStartingSlash(path)
  const dir = Object.keys(sidebar)
    .sort((a, b) => b.split('/').length - a.split('/').length)
    .find(dir => normalizedPath.startsWith(ensureStartingSlash(dir)))

  const matched = dir ? sidebar[dir] : []

  return Array.isArray(matched)
    ? addBase(matched)
    : addBase(matched.items, matched.base)
}

/**
 * Convert resolved sidebar entries into renderable groups.
 *
 * Explicit groups with `items` are kept as groups. Consecutive top-level links
 * or category names are grouped into an anonymous group, matching VitePress'
 * sidebar rendering model.
 */
export function getSidebarGroups(sidebar: PressTheme.SidebarEntry[]): SidebarGroup[] {
  const groups: SidebarGroup[] = []
  let lastGroupIndex = 0

  for (const item of sidebar) {
    if (isSidebarItem(item) && item.items) {
      groups.push({
        ...item,
        items: item.items,
      })
      lastGroupIndex = groups.length
      continue
    }

    if (!groups[lastGroupIndex])
      groups.push({ items: [] })

    groups[lastGroupIndex].items.push(item)
  }

  return groups
}

export function isSidebarItem(item: PressTheme.SidebarEntry): item is PressTheme.SidebarItem {
  return typeof item !== 'string'
}

function ensureStartingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

function addBase(items: PressTheme.SidebarEntry[], base?: string): PressTheme.SidebarEntry[] {
  return items.map(item => addBaseToItem(item, base))
}

function addBaseToItem(item: PressTheme.SidebarEntry, base?: string): PressTheme.SidebarEntry {
  if (!isSidebarItem(item))
    return item

  const result = { ...item }
  const itemBase = result.base || base

  if (itemBase && result.link)
    result.link = itemBase + result.link.replace(/^\//, itemBase.endsWith('/') ? '' : '/')

  if (result.items)
    result.items = addBase(result.items, itemBase).filter(isSidebarItem)

  return result
}
