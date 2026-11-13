import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import escapeHtml from 'escape-html'
import { isNotFoundPagePath } from '../../shared/page-policy'

export async function writeSitemap(outDir: string, siteUrl: string, routes: string[]) {
  if (!/^https?:\/\//i.test(siteUrl))
    return

  const base = new URL(siteUrl)
  base.pathname = `${base.pathname.replace(/\/+$/, '')}/`
  base.search = ''
  base.hash = ''

  const urls = new Map<string, string>()
  for (const route of routes) {
    const url = new URL(`.${route}`, base)
    if (isNotFoundPagePath(url.pathname))
      continue

    // A file router can expose both /about and /about/ for the same index.
    // Keep the directory URL if present and preserve the spelling of other routes.
    const key = url.href.replace(/\/$/, '')
    if (!urls.has(key) || url.pathname.endsWith('/'))
      urls.set(key, url.href)
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...[...urls.values()].sort().map(url => `  <url><loc>${escapeHtml(url)}</loc></url>`),
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
