import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'

// Cloudflare Pages serves a top-level 404.html with HTTP 404 for unknown paths.
// Without that file it treats the site as an SPA and returns the homepage with 200.
const root = resolve(import.meta.dirname, '../dist')
const notFoundPath = resolve(root, '404.html')

let notFound
try {
  notFound = await readFile(notFoundPath, 'utf8')
}
catch {
  console.error('docs/dist/404.html is missing. Cloudflare Pages would serve the homepage with HTTP 200 for unknown paths.')
  process.exit(1)
}

const home = await readFile(resolve(root, 'index.html'), 'utf8')
if (notFound === home) {
  console.error('docs/dist/404.html matches the homepage. Unknown paths would still look like a soft 404.')
  process.exit(1)
}

if (!notFound.includes('This page drifted out of orbit.')) {
  console.error('docs/dist/404.html does not contain the docs not-found page.')
  process.exit(1)
}

// The file must exist for Cloudflare without being advertised as a public URL.
const sitemapPath = resolve(root, 'sitemap.xml')
const sitemap = await readFile(sitemapPath, 'utf8')
if (/<loc>https:\/\/valaxy\.site\/404(?:\/|\.html)?<\/loc>/.test(sitemap)) {
  console.error('The docs sitemap lists the 404 page.')
  process.exit(1)
}

console.log('docs/dist/404.html is present for Cloudflare Pages custom 404s.')
