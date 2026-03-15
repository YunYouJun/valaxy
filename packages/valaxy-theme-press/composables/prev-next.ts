import type { PressTheme } from '../types'
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLocaleConfig } from './locale'
import { normalize } from './sidebar'

export interface DocFooterLink {
  text: string
  link: string
}

/**
 * Resolve sidebar items for the current route path from the theme config.
 */
function getSidebarItems(
  sidebar: PressTheme.Sidebar | undefined,
  path: string,
): PressTheme.SidebarItem[] {
  if (!sidebar)
    return []

  if (Array.isArray(sidebar)) {
    // Sidebar arrays may contain strings (category names) — filter to objects only
    const items = sidebar.filter((item): item is PressTheme.SidebarItem => typeof item !== 'string')
    return addBase(items)
  }

  // SidebarMulti: find the longest matching prefix
  path = ensureStartingSlash(path)
  const dir = Object.keys(sidebar)
    .sort((a, b) => b.split('/').length - a.split('/').length)
    .find(dir => path.startsWith(ensureStartingSlash(dir)))

  if (!dir)
    return []

  const matched = sidebar[dir]
  if (Array.isArray(matched)) {
    const items = matched.filter((item): item is PressTheme.SidebarItem => typeof item !== 'string')
    return addBase(items)
  }

  return addBase(matched.items, matched.base)
}

function ensureStartingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * Join base and link with exactly one `/` separator.
 */
function joinPath(base: string, link: string): string {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  const normalizedLink = link.startsWith('/') ? link : `/${link}`
  return normalizedBase + normalizedLink
}

function addBase(items: PressTheme.SidebarItem[], base?: string): PressTheme.SidebarItem[] {
  return items.map((item) => {
    const result = { ...item }
    const itemBase = result.base || base
    if (itemBase && result.link)
      result.link = joinPath(itemBase, result.link)
    if (result.items)
      result.items = addBase(result.items, itemBase)
    return result
  })
}

interface FlatLink {
  text: string
  link: string
  docFooterText?: string
}

/**
 * Recursively flatten sidebar items into a flat list of links.
 */
function getFlatLinks(items: PressTheme.SidebarItem[]): FlatLink[] {
  const links: FlatLink[] = []

  function extract(items: PressTheme.SidebarItem[]) {
    for (const item of items) {
      if (item.text && item.link) {
        links.push({
          text: item.text,
          link: item.link,
          docFooterText: item.docFooterText,
        })
      }
      if (item.items)
        extract(item.items)
    }
  }

  extract(items)
  return links
}

/**
 * Composable to compute previous and next page links
 * based on the sidebar configuration, similar to VitePress.
 */
export function usePrevNext() {
  const route = useRoute()
  const frontmatter = useFrontmatter()
  const { localeConfig } = useLocaleConfig()

  return computed(() => {
    const sidebar = localeConfig.value.sidebar
    const candidates = getFlatLinks(getSidebarItems(sidebar, route.path))

    const index = candidates.findIndex(link =>
      normalize(link.link) === normalize(route.path),
    )

    let prev: DocFooterLink | undefined
    let next: DocFooterLink | undefined

    if (index > 0) {
      const link = candidates[index - 1]
      prev = {
        text: link.docFooterText || link.text,
        link: link.link,
      }
    }

    if (index !== -1 && index < candidates.length - 1) {
      const link = candidates[index + 1]
      next = {
        text: link.docFooterText || link.text,
        link: link.link,
      }
    }

    // Allow frontmatter to disable navigation
    if (frontmatter.value.nav === false) {
      prev = undefined
      next = undefined
    }

    return { prev, next }
  })
}
