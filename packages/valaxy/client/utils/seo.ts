import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { EXTERNAL_URL_RE } from '../../shared'
import { resolveSiteUrl } from './path'

/** Keep URL parameters while using the matched route's trailing-slash convention. */
export function resolveCanonicalPath(route: Pick<RouteLocationNormalizedLoaded, 'path' | 'matched'>): string {
  const matchedPath = route.matched.at(-1)?.path
  if (!matchedPath || route.path === '/')
    return route.path

  const path = route.path.replace(/\/+$/, '')
  return matchedPath.endsWith('/') ? `${path}/` : path
}

/**
 * Resolve a share image against the page when it is relative, and against the
 * site deployment path when it is root-absolute. Absolute URLs are unchanged.
 */
export function resolveShareImage(siteUrl: string, pagePath: string, src: string): string {
  if (!src || EXTERNAL_URL_RE.test(src) || !/^https?:\/\//.test(siteUrl))
    return src
  if (src.startsWith('/')) {
    // Vite asset imports already include the deployment base.
    const base = new URL(siteUrl).pathname.replace(/\/+$/, '')
    if (base && src.startsWith(`${base}/`))
      return new URL(src, siteUrl).href
    return resolveSiteUrl(siteUrl, src)
  }

  const directory = pagePath.endsWith('/') ? pagePath : pagePath.replace(/[^/]*$/, '')
  const basePath = directory.startsWith('/') ? directory : `/${directory}`
  try {
    const resolved = new URL(src, `http://valaxy.local${basePath}`)
    return resolveSiteUrl(siteUrl, `${resolved.pathname}${resolved.search}${resolved.hash}`)
  }
  catch {
    return src
  }
}
