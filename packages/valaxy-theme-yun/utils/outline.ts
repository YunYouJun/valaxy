import type { MenuItem } from 'valaxy'

export function normalizeOutlineHash(hash: string): string {
  try {
    return decodeURIComponent(hash)
  }
  catch {
    return hash
  }
}

export function buildOutlineBranchId(path: string, link: string): string {
  const slug = normalizeOutlineHash(link)
    .replace(/^#/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return slug ? `yun-outline-branch-${path}__${slug}` : `yun-outline-branch-${path}`
}

export function collectCollapsibleOutlineLinks(headers: MenuItem[]): string[] {
  const links: string[] = []

  const walk = (items: MenuItem[]) => {
    for (const item of items) {
      if (item.children?.length) {
        links.push(item.link)
        walk(item.children)
      }
    }
  }

  walk(headers)
  return links
}

export function findOutlineAncestorLinks(
  headers: MenuItem[],
  activeLink: string | null,
): Set<string> {
  const ancestors = new Set<string>()
  if (!activeLink)
    return ancestors

  const target = normalizeOutlineHash(activeLink)

  const walk = (items: MenuItem[], chain: string[]): boolean => {
    for (const item of items) {
      if (normalizeOutlineHash(item.link) === target) {
        for (const ancestor of chain)
          ancestors.add(ancestor)
        return true
      }

      if (item.children?.length && walk(item.children, [...chain, item.link]))
        return true
    }
    return false
  }

  walk(headers, [])
  return ancestors
}

export function computeAutoCollapsedLinks(
  headers: MenuItem[],
  activeLink: string | null,
): Set<string> {
  const collapsible = collectCollapsibleOutlineLinks(headers)
  if (!collapsible.length)
    return new Set()

  const normalizedActive = activeLink ? normalizeOutlineHash(activeLink) : null
  const ancestors = findOutlineAncestorLinks(headers, activeLink)
  const normalizedAncestors = new Set([...ancestors].map(normalizeOutlineHash))
  const collapsed = new Set<string>()

  for (const link of collapsible) {
    const normalizedLink = normalizeOutlineHash(link)
    const isCurrentOrAncestor = normalizedActive === normalizedLink || normalizedAncestors.has(normalizedLink)
    if (!isCurrentOrAncestor)
      collapsed.add(link)
  }

  return collapsed
}
