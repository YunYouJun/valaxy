import { EXTERNAL_URL_RE } from '../../shared'

/**
 * Join two URL paths while resolving a slash collision.
 */
function joinPath(base: string, path: string): string {
  return `${base}${path}`.replace(/\/+/g, '/')
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
