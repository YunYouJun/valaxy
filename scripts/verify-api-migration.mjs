import assert from 'node:assert/strict'
import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { parseFragment } from 'parse5'
import { apiDestination, apiRedirects, formatApiRedirects } from './lib/api-redirects.mjs'

const root = resolve('docs/dist')
const legacy = process.argv.includes('--legacy-redirects')
  ? JSON.parse(await readFile('deploy/api-redirects/legacy-pages.json', 'utf8'))
  : undefined
const pages = new Map()
const errors = []

function getAttr(node, name) {
  return node.attrs?.find(attr => attr.name === name && !attr.namespace)?.value
}

function parsePage(html) {
  // Match JSDOM.fragment semantics (HTML5 tree, inert <template>, case-insensitive link[rel]).
  const fragment = parseFragment(html)
  const ids = new Set()
  let firstMain = null
  let seenCanonical = false
  let canonical

  function walk(node) {
    if (node.attrs) {
      const id = getAttr(node, 'id')
      if (id !== undefined)
        ids.add(id)
      if (!seenCanonical && node.tagName === 'link') {
        const rel = getAttr(node, 'rel')
        if (rel?.toLowerCase() === 'canonical') {
          seenCanonical = true
          canonical = getAttr(node, 'href') ?? null
        }
      }
      if (!firstMain && node.tagName === 'main')
        firstMain = node
    }
    if (node.childNodes) {
      for (const child of node.childNodes)
        walk(child)
    }
  }
  walk(fragment)

  const links = []
  function collectLinks(node) {
    if (node.attrs && node.tagName === 'a' && node.attrs.some(attr => attr.name === 'href'))
      links.push(getAttr(node, 'href') ?? null)
    if (node.childNodes) {
      for (const child of node.childNodes)
        collectLinks(child)
    }
  }
  collectLinks(firstMain || fragment)

  return {
    ids,
    links,
    canonical: canonical ?? undefined,
  }
}

async function readPage(path) {
  path = decodeURIComponent(path)
  const key = path.replace(/\.(?:md|html)$/, '').replace(/\/index$/, '/') || '/'
  if (pages.has(key))
    return pages.get(key)
  const stem = resolve(root, `.${key}`)
  const candidates = key.endsWith('/') ? [`${stem}/index.html`, `${stem}.html`] : [`${stem}.html`, `${stem}/index.html`]
  for (const file of candidates) {
    try {
      const page = parsePage(await readFile(file, 'utf8'))
      pages.set(key, page)
      return page
    }
    catch (error) {
      if (error.code !== 'ENOENT')
        throw error
    }
  }
}

const redirects = legacy ? apiRedirects(legacy) : undefined
for (const { path, anchors } of legacy?.pages || []) {
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
for (const path of ['/api/', '/zh/api/', '/api/client/', '/api/node/', '/api/types/'])
  assert(await readPage(path), `Missing required API entry: ${path}. Run pnpm docs:build first.`)
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
console.log(`Verified ${htmlFiles.length} API pages and ${linkCount} internal links.`)
if (legacy && redirects) {
  // Optional artifact: publish ONLY as the old domain's static redirects project.
  const output = resolve('deploy/api-redirects/dist')
  await mkdir(output, { recursive: true })
  await writeFile(resolve(output, '_redirects'), formatApiRedirects(redirects))
  await writeFile(resolve(output, 'index.html'), '<!doctype html><title>Valaxy API moved</title><a href="https://valaxy.site/api/">Valaxy API documentation</a>\n')
  console.log(`Verified ${legacy.pages.length} legacy pages; prepared ${redirects.size} HTTP 301 rules.`)
}
