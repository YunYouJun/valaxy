/**
 * Production publishing rules for files under `pages/`.
 * `draft: true` stays routable in development and is omitted from production
 * unless `publishing.drafts` is set. Underscore paths and README.md are not
 * routes unless the matching flag is set.
 */
export interface PagePublishing {
  /** Publish `draft: true` pages in production output. */
  drafts?: boolean
  /** Publish files and directories whose names start with `_`. */
  underscore?: boolean
  /** Publish `README.md` files under `pages/`. */
  readme?: boolean
}

export function normalizePagePath(filePath: string): string {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '')
}

/**
 * Page path relative to a `pages/` directory.
 * `pages/posts/hello.md` and `/abs/pages/posts/hello.md` both become `posts/hello.md`.
 */
export function relativePagePath(filePath: string, userRoot?: string): string | undefined {
  const normalized = normalizePagePath(filePath)
  if (userRoot) {
    const root = normalizePagePath(userRoot).replace(/\/$/, '')
    const prefixes = [`${root}/pages/`, `${root}/.valaxy/content/pages/`]
    for (const prefix of prefixes) {
      if (normalized.startsWith(prefix))
        return normalized.slice(prefix.length)
    }
  }

  const markers = ['/.valaxy/content/pages/', '/pages/']
  for (const marker of markers) {
    const index = normalized.lastIndexOf(marker)
    if (index >= 0)
      return normalized.slice(index + marker.length)
  }

  if (normalized.startsWith('pages/'))
    return normalized.slice('pages/'.length)
}

export function isUnderscorePage(relativePath: string): boolean {
  return normalizePagePath(relativePath)
    .split('/')
    .some(segment => segment.startsWith('_'))
}

export function isReadmePage(relativePath: string): boolean {
  const base = normalizePagePath(relativePath).split('/').pop() || ''
  return /^readme\.md$/i.test(base)
}

/** True when this source file must not become a public route. */
export function isUnpublishedPage(relativePath: string, publishing: PagePublishing = {}): boolean {
  if (!publishing.underscore && isUnderscorePage(relativePath))
    return true
  if (!publishing.readme && isReadmePage(relativePath))
    return true
  return false
}

/**
 * Picomatch globs for the file router. They are a fast path; route extension
 * also drops these files so a custom exclude list cannot publish them by accident.
 */
export function pageExcludeGlobs(publishing: PagePublishing = {}): string[] {
  const globs: string[] = []
  if (!publishing.underscore)
    globs.push('**/_*/**', '**/_*')
  if (!publishing.readme)
    globs.push('**/[Rr][Ee][Aa][Dd][Mm][Ee].[Mm][Dd]')
  return globs
}

export function normalizeExcludeGlobs(exclude: unknown): string[] {
  if (typeof exclude === 'string')
    return [exclude]
  if (Array.isArray(exclude))
    return exclude.filter((item): item is string => typeof item === 'string')
  return []
}

export function mergePageExcludes(publishing: PagePublishing | undefined, userExclude: unknown): string[] {
  const defaults = pageExcludeGlobs(publishing)
  if (typeof userExclude === 'function')
    return userExclude(defaults)
  return [...defaults, ...normalizeExcludeGlobs(userExclude)]
}

interface DraftRoute {
  meta?: { frontmatter?: { draft?: boolean } }
  children?: DraftRoute[]
}

/**
 * Drop `draft: true` routes from a production route tree.
 * Development keeps them so authors can preview. Mutates child arrays the same way the router setup always has.
 */
export function omitProductionDraftRoutes<T extends DraftRoute>(routes: T[], includeDrafts = false): T[] {
  if (includeDrafts)
    return routes

  return routes.filter((route) => {
    if (route.children?.length)
      route.children = omitProductionDraftRoutes(route.children, includeDrafts)
    return !route.meta?.frontmatter?.draft
  })
}

/** Paths reserved for a site's not-found document. */
export function isNotFoundPagePath(path: string): boolean {
  return /\/404(?:\.html|\/(?:index\.html)?)?$/.test(path)
}
