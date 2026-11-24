import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import escapeHtml from 'escape-html'
import { isNotFoundPagePath } from '../../shared/page-policy'

interface SitemapPage {
  route: string
  canonical?: string
  baseHref?: string
  /** ISO timestamp from the rendered page. Omitted when the page has no date. */
  lastmod?: string
  /** When this contains `noindex` or `none`, the page stays out of the sitemap. */
  robots?: string
}

function isNoindexRobots(robots?: string): boolean {
  if (!robots)
    return false
  return robots.toLowerCase().split(/[\s,]+/).some(token => token === 'noindex' || token === 'none')
}

function urlKey(url: URL): string {
  const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname
  return `${url.origin}${pathname}${url.search}`
}

export async function writeSitemap(outDir: string, siteUrl: string, pages: SitemapPage[]) {
  if (!/^https?:\/\//i.test(siteUrl))
    return

  const base = new URL(siteUrl)
  base.pathname = `${base.pathname.replace(/\/+$/, '')}/`
  base.search = ''
  base.hash = ''

  const excludedKeys = new Set<string>()
  for (const { route, robots } of pages) {
    if (!isNoindexRobots(robots))
      continue
    excludedKeys.add(urlKey(new URL(`.${route}`, base)))
  }

  const urls = new Set<string>()
  const lastmods = new Map<string, string>()
  const routesWithCanonical = new Set<string>()
  const fallbacks = new Map<string, string>()
  const fallbackLastmods = new Map<string, string>()
  const remember = (url: string, lastmod?: string) => {
    if (lastmod && (!lastmods.has(url) || lastmod > lastmods.get(url)!))
      lastmods.set(url, lastmod)
  }
  for (const { route, canonical, baseHref, lastmod, robots } of pages) {
    if (isNoindexRobots(robots))
      continue

    const routeUrl = new URL(`.${route}`, base)
    if (isNotFoundPagePath(routeUrl.pathname))
      continue

    const key = routeUrl.href.replace(/\/$/, '')
    if (canonical !== undefined) {
      routesWithCanonical.add(key)
      const documentBase = baseHref ? URL.parse(baseHref, routeUrl) ?? routeUrl : routeUrl
      const url = canonical.trim() ? URL.parse(canonical, documentBase) : null
      // Cross-site canonicals and pages pointing to noindex destinations stay out of the sitemap.
      if (
        url?.origin === base.origin
        && url.pathname.startsWith(base.pathname)
        && !isNotFoundPagePath(url.pathname)
        && !excludedKeys.has(urlKey(url))
      ) {
        urls.add(url.href)
        remember(url.href, lastmod)
      }
    }
    // Custom layouts without a canonical still get a route entry. Prefer the
    // directory URL if the router exposes both /about and /about/ for it.
    else if (!fallbacks.has(key) || routeUrl.pathname.endsWith('/')) {
      fallbacks.set(key, routeUrl.href)
      if (lastmod)
        fallbackLastmods.set(key, lastmod)
    }
  }
  for (const [key, url] of fallbacks) {
    if (!routesWithCanonical.has(key) && !excludedKeys.has(urlKey(new URL(url)))) {
      urls.add(url)
      remember(url, fallbackLastmods.get(key))
    }
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...[...urls].sort().map((url) => {
      const lastmod = lastmods.get(url)
      const modified = lastmod ? `<lastmod>${escapeHtml(lastmod)}</lastmod>` : ''
      return `  <url><loc>${escapeHtml(url)}</loc>${modified}</url>`
    }),
    '</urlset>',
    '',
  ].join('\n')

  await Promise.all([
    writeFile(join(outDir, 'sitemap.xml'), sitemap),
    writeFile(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap.xml', base).href}\n`, { flag: 'wx' })
      .catch((error) => {
        // Vite has already copied any site-provided robots.txt to the output.
        if (error.code !== 'EEXIST')
          throw error
      }),
  ])
}
