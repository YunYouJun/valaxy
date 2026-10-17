import { EXTERNAL_URL_RE } from '../../shared'

/**
 * Join two URL paths while resolving a slash collision.
 */
function joinPath(base: string, path: string): string {
  return `${base}${path}`.replace(/\/+/g, '/')
}

/**
 * Decode a percent-encoded URL path (`/posts/%E4%B8%AD` → `/posts/中`).
 *
 * Route records and `route.path` are percent-encoded, while file names, config
 * links and collection keys are written raw. Decode before comparing them.
 * Malformed sequences return the path unchanged.
 */
export function decodePath(path: string): string {
  try {
    return decodeURI(path)
  }
  catch {
    return path
  }
}

/**
 * Check whether a page file path (`/posts/中文.md`, `/guide/index.md`) is the page
 * shown at a browser `pathname` (`/base/posts/%E4%B8%AD%E6%96%87`).
 */
export function isSamePagePath(filePath: string, pathname: string, base = '/'): boolean {
  const pagePath = filePath.replace(/(?:(^|\/)index)?\.md$/, '$1')
  let locationPath = decodePath(pathname).replace(/(?:(^|\/)index)?\.html$/, '$1')
  if (base !== '/' && locationPath.startsWith(base))
    locationPath = locationPath.slice(base.length - 1)

  const withSlash = (path: string) => path.endsWith('/') ? path : `${path}/`
  return withSlash(pagePath) === withSlash(locationPath)
}

/**
 * Append Vite's resolved base to an internal root-absolute URL.
 * External and relative URLs are returned unchanged.
 */
export function withBase(path: string): string {
  return EXTERNAL_URL_RE.test(path) || !path.startsWith('/')
    ? path
    : joinPath(import.meta.env.BASE_URL, path)
}

/**
 * Resolve an internal path against the configured canonical site URL.
 * Root-absolute paths remain relative to a site URL's deployment subpath.
 */
export function resolveSiteUrl(siteUrl: string, path: string): string {
  if (!path || EXTERNAL_URL_RE.test(path) || !/^https?:\/\//.test(siteUrl))
    return path

  return new URL(path.replace(/^\/+/, ''), `${siteUrl.replace(/\/+$/, '')}/`).href
}
