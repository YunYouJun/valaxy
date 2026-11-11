import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { SocialLink } from '../../types'
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

/** Public identity links only; this never changes the site's social navigation. */
export function resolveSocialSameAs(siteUrl: string, social: Pick<SocialLink, 'link' | 'sameAs'>[], feedName?: string): string[] {
  const urls = new Set<string>()
  const feeds = new Set((feedName ? [`${feedName}.xml`, `${feedName}.atom`, `${feedName}.json`] : [])
    .map(path => resolveSiteUrl(siteUrl, path)))

  for (const item of social) {
    const value = typeof item.link === 'string' ? item.link.trim() : ''
    if (item.sameAs === false || !value || /^[?#]/.test(value)
      || value.includes('\\') || Array.from(value).some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) {
      continue
    }
    // Do not let URL parsing repair a malformed scheme into a relative page.
    if (/^[a-z][a-z\d+.-]*:/i.test(value) && !/^https?:\/\/[^/\s]/i.test(value))
      continue
    if (value.startsWith('///'))
      continue

    try {
      // Keep root-relative links pointing to the same destination as social anchors.
      const resolved = value.startsWith('/') ? value : resolveSiteUrl(siteUrl, value)
      const url = /^https?:\/\//i.test(resolved) ? new URL(resolved) : new URL(resolved, siteUrl)
      if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password)
        continue

      // Recognize feed filenames, not arbitrary account names, domains or icons.
      // Extensionless subscription/group links can opt out with sameAs: false.
      const filename = decodeURIComponent(url.pathname).split('/').pop() || ''
      if (/^(?:atom|rss|rss2|feed)\.xml$|^feed\.json$|\.(?:atom|rss)$/i.test(filename)
        || feeds.has(`${url.origin}${url.pathname}`)) {
        continue
      }
      urls.add(url.href)
    }
    catch {}
  }
  return [...urls]
}
