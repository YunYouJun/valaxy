import assert from 'node:assert/strict'
import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { JSDOM } from 'jsdom'
import { apiDestination, apiRedirects, formatApiRedirects } from './lib/api-redirects.mjs'

const root = resolve('docs/dist')
const legacy = JSON.parse(await readFile('api/migration/legacy-pages.json', 'utf8'))
const pages = new Map()
const errors = []

async function readPage(path) {
  path = decodeURIComponent(path)
  const key = path.replace(/\.(?:md|html)$/, '').replace(/\/index$/, '/') || '/'
  if (pages.has(key))
    return pages.get(key)
  const stem = resolve(root, `.${key}`)
  const candidates = key.endsWith('/') ? [`${stem}/index.html`, `${stem}.html`] : [`${stem}.html`, `${stem}/index.html`]
  for (const file of candidates) {
    try {
      const dom = JSDOM.fragment(await readFile(file, 'utf8'))
      const main = dom.querySelector('main') || dom
      const page = {
        ids: new Set([...dom.querySelectorAll('[id]')].map(element => element.id)),
        links: [...main.querySelectorAll('a[href]')].map(element => element.getAttribute('href')),
        canonical: dom.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      }
      pages.set(key, page)
      return page
    }
    catch (error) {
      if (error.code !== 'ENOENT')
        throw error
    }
  }
}

const redirects = apiRedirects(legacy)
for (const { path, anchors } of legacy.pages) {
  const target = apiDestination(path)
  const page = await readPage(target)
  if (!page) {
    errors.push(`Missing migration target: ${path} → ${target}`)
    continue
  }
  for (const anchor of anchors) {
    if (!page.ids.has(anchor))
      errors.push(`Lost legacy anchor: ${path}#${anchor} → ${target}`)
  }
}

let linkCount = 0
const canonicalByPage = new Map()
const htmlFiles = (await readdir(root, { recursive: true })).filter(file => file.endsWith('.html') && (file.startsWith('api/') || file === 'api.html' || file === 'zh/api.html'))
for (const file of htmlFiles) {
  const path = `/${file.replace(/index\.html$/, '').replace(/\.html$/, '')}`
  const page = await readPage(path)
  assert(page, `Missing API page: ${path}`)
  const canonicalKey = path.replace(/\/$/, '')
  const previousCanonical = canonicalByPage.get(canonicalKey)
  if (!page.canonical || (previousCanonical && previousCanonical !== page.canonical))
    errors.push(`Inconsistent canonical URL: ${path} → ${page.canonical}`)
  canonicalByPage.set(canonicalKey, page.canonical)
  for (const link of page.links) {
    const url = new URL(link, `https://valaxy.site${path}`)
    if (url.origin !== 'https://valaxy.site')
      continue
    if (/\.[a-z0-9]+$/i.test(url.pathname) && !/\.(?:html|md)$/.test(url.pathname)) {
      await access(resolve(root, `.${decodeURIComponent(url.pathname)}`)).catch(() => errors.push(`Missing asset: ${path} → ${link}`))
      continue
    }
    const target = await readPage(url.pathname)
    if (!target)
      errors.push(`Dead API link: ${path} → ${link}`)
    else if (url.hash && !target.ids.has(decodeURIComponent(url.hash.slice(1))))
      errors.push(`Dead API anchor: ${path} → ${link}`)
    linkCount++
  }
}

assert.equal(errors.length, 0, errors.slice(0, 50).join('\n'))
// Publish this directory ONLY as the old domain's static redirects project.
const output = resolve('api/migration/dist')
await mkdir(output, { recursive: true })
await writeFile(resolve(output, '_redirects'), formatApiRedirects(redirects))
await writeFile(resolve(output, 'index.html'), '<!doctype html><title>Valaxy API moved</title><a href="https://valaxy.site/api/">Valaxy API documentation</a>\n')
console.log(`Verified ${htmlFiles.length} API pages, ${linkCount} internal links, ${legacy.pages.length} legacy pages; prepared ${redirects.size} HTTP 301 rules.`)
