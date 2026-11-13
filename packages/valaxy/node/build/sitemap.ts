import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import escapeHtml from 'escape-html'
import { isNotFoundPagePath } from '../../shared/page-policy'

interface SitemapPage {
  route: string
  canonical?: string
  baseHref?: string
}

export async function writeSitemap(outDir: string, siteUrl: string, pages: SitemapPage[]) {
  if (!/^https?:\/\//i.test(siteUrl))
    return

  const base = new URL(siteUrl)
  base.pathname = `${base.pathname.replace(/\/+$/, '')}/`
  base.search = ''
  base.hash = ''

  const urls = new Set<string>()
  const routesWithCanonical = new Set<string>()
  const fallbacks = new Map<string, string>()
  for (const { route, canonical, baseHref } of pages) {
    const routeUrl = new URL(`.${route}`, base)
    if (isNotFoundPagePath(routeUrl.pathname))
      continue

    const key = routeUrl.href.replace(/\/$/, '')
    if (canonical !== undefined) {
      routesWithCanonical.add(key)
      const documentBase = baseHref ? URL.parse(baseHref, routeUrl) ?? routeUrl : routeUrl
      const url = canonical.trim() ? URL.parse(canonical, documentBase) : null
      // Cross-site canonicals can remain in the HTML, but do not belong in this sitemap.
      if (url?.origin === base.origin && url.pathname.startsWith(base.pathname) && !isNotFoundPagePath(url.pathname))
        urls.add(url.href)
    }
    // Custom layouts without a canonical still get a route entry. Prefer the
    // directory URL if the router exposes both /about and /about/ for it.
    else if (!fallbacks.has(key) || routeUrl.pathname.endsWith('/')) {
      fallbacks.set(key, routeUrl.href)
    }
  }
  for (const [key, url] of fallbacks) {
    if (!routesWithCanonical.has(key))
      urls.add(url)
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...[...urls].sort().map(url => `  <url><loc>${escapeHtml(url)}</loc></url>`),
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
