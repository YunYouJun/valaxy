import type { YunTheme } from '../types'

const EXTERNAL_LINK_RE = /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i

/** Resolve the sidebar that best matches the current route. */
export function resolveYunDocsSidebar(
  sidebar: YunTheme.Sidebar | null | undefined,
  path: string,
): YunTheme.SidebarItem[] {
  if (Array.isArray(sidebar))
    return addBase(sidebar)

  if (!sidebar)
    return []

  const normalizedPath = ensureStartingSlash(path)
  const matchedPrefix = Object.keys(sidebar)
    .sort((a, b) => ensureStartingSlash(b).length - ensureStartingSlash(a).length)
    .find(prefix => normalizedPath.startsWith(ensureStartingSlash(prefix)))

  if (!matchedPrefix)
    return []

  const matched = sidebar[matchedPrefix]
  return Array.isArray(matched)
    ? addBase(matched)
    : addBase(matched.items, matched.base)
}

/** Check whether a link points at the current document. */
export function isYunDocsSidebarLinkActive(currentPath: string, link?: string): boolean {
  if (!link || EXTERNAL_LINK_RE.test(link))
    return false

  return normalizePath(currentPath) === normalizePath(link)
}

/** Check whether an item or one of its descendants is active. */
export function containsYunDocsSidebarActiveLink(
  currentPath: string,
  item: YunTheme.SidebarItem,
): boolean {
  return isYunDocsSidebarLinkActive(currentPath, item.link)
    || Boolean(item.items?.some(child => containsYunDocsSidebarActiveLink(currentPath, child)))
}

function ensureStartingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

function normalizePath(path: string): string {
  const normalized = ensureStartingSlash(path)
    .replace(/#.*$/, '')
    .replace(/(?:index)?\.(?:md|html)$/, '')
    .replace(/\/+$/, '')

  return normalized || '/'
}

function addBase(items: YunTheme.SidebarItem[], base?: string): YunTheme.SidebarItem[] {
  return items.map(item => addBaseToItem(item, base))
}

function addBaseToItem(item: YunTheme.SidebarItem, inheritedBase?: string): YunTheme.SidebarItem {
  const result = { ...item }
  const base = result.base || inheritedBase

  if (base && result.link && !EXTERNAL_LINK_RE.test(result.link))
    result.link = joinPath(base, result.link)

  if (result.items)
    result.items = addBase(result.items, base)

  return result
}

function joinPath(base: string, path: string): string {
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}
