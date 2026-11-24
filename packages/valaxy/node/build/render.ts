import type { Unhead } from 'unhead/server'
import { access, constants, copyFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { renderSSRHead } from '@unhead/vue/server'
import { Parser } from 'htmlparser2'
import pMap from 'p-map'
import { isNotFoundPagePath } from '../../shared/page-policy'
import { schemaDate } from '../../shared/seo'

export interface RenderResult {
  html: string
  head: Unhead | undefined
  modules?: Set<string>
  teleports?: Record<string, string>
  initialState: Record<string, any>
}

export interface RenderPageOptions {
  render: (route: string) => Promise<RenderResult>
  route: string
  template: string
  ssrManifest: Record<string, string[]>
  outDir: string
  onBeforePageRender?: (route: string, html: string) => Promise<string | void> | string | void
  onPageRendered?: (route: string, html: string) => Promise<string | void> | string | void
}

/**
 * Render a single page to an HTML file.
 * Pure string operations — zero JSDOM.
 */
export async function renderPage(opts: RenderPageOptions) {
  let template = opts.template

  if (opts.onBeforePageRender) {
    template = await opts.onBeforePageRender(opts.route, template) || template
  }

  const result = await opts.render(opts.route)

  // 1. renderSSRHead — pure string output, no DOM
  const headPayload = result.head
    ? await renderSSRHead(result.head as Unhead)
    : { headTags: '', bodyTags: '', bodyTagsOpen: '', htmlAttrs: '', bodyAttrs: '' }

  // 2. Preload links from SSR manifest — string concatenation
  const preloadLinks = renderPreloadLinks(result.modules, opts.ssrManifest, template)

  // 3. Serialise initial state
  const stateScript = serializeState(result.initialState)

  // 4. Assemble HTML via string replacement
  let html = template

  if (headPayload.htmlAttrs)
    html = html.replace(/<html[^>]*>/, () => `<html ${headPayload.htmlAttrs}>`)

  if (headPayload.bodyAttrs)
    html = html.replace(/<body[^>]*>/, () => `<body ${headPayload.bodyAttrs}>`)

  html = html
    .replace('</head>', () => `${preloadLinks}${headPayload.headTags}\n</head>`)
    .replace(
      '<div id="app"></div>',
      () => `${headPayload.bodyTagsOpen || ''}<div id="app">${result.html}</div>${stateScript}${headPayload.bodyTags || ''}`,
    )

  // Handle teleported content
  if (result.teleports) {
    for (const [target, content] of Object.entries(result.teleports)) {
      if (target === '#valaxy-teleports') {
        const container = '<div id="valaxy-teleports"></div>'
        if (!html.includes(container))
          throw new Error('Missing #valaxy-teleports container in the HTML template')
        html = html.replace(container, () => `<div id="valaxy-teleports">${content}</div>`)
      }
      else if (target === 'head') {
        html = html.replace('</head>', () => `${content}\n</head>`)
      }
      else if (target === 'body') {
        // Disabled Teleports hydrate from the target's first child. Keep their
        // anchors before #app so unmounting a portal cannot remove the app root.
        html = html.replace(/<body\b[^>]*>/, match => `${match}${content}`)
      }
      else {
        // Custom teleport targets (e.g. #modal-root) can't be resolved
        // without a DOM. Fall back to injecting at end of <body>.
        html = html.replace('</body>', () => `${content}\n</body>`)
      }
    }
  }

  if (opts.onPageRendered) {
    html = await opts.onPageRendered(opts.route, html) || html
  }

  // 5. Write file
  const fileName = routeToFileName(opts.route)
  const filePath = resolve(opts.outDir, fileName)
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, html, 'utf-8')

  return { route: opts.route, ...readRenderedHead(html) }
}

export interface RenderedHead {
  canonical?: string
  baseHref?: string
  robots?: string
  lastmod?: string
}

function visitHeadTags(html: string, visit: (tag: string, attrs: Record<string, string>) => void) {
  let inHead = false
  let inertDepth = 0
  const parser = new Parser({
    onopentag(tag, attrs) {
      if (tag === 'body') {
        parser.pause()
        return
      }
      if (tag === 'head')
        inHead = true
      if (!inHead)
        return
      if (tag === 'template' || tag === 'noscript')
        inertDepth++
      if (inertDepth)
        return
      visit(tag, attrs)
    },
    onclosetag(tag) {
      if ((tag === 'template' || tag === 'noscript') && inertDepth)
        inertDepth--
      if (tag === 'head')
        parser.pause()
    },
  })
  parser.end(html)
}

const FALLBACK_BASE = 'https://valaxy.local/'

/** Read the final head, including changes made by onPageRendered. */
export function readRenderedHead(html: string): RenderedHead {
  let canonical: string | undefined
  let baseHref: string | undefined
  let robots: string | undefined
  const schema: string[] = []
  let captureSchema = false
  let schemaText = ''
  let inHead = false
  let inertDepth = 0
  const parser = new Parser({
    onopentag(tag, attrs) {
      if (tag === 'head')
        inHead = true
      if (tag === 'template' || tag === 'noscript')
        inertDepth++
      if (inertDepth)
        return
      // Canonical and robots live in head. Schema.org JSON-LD is emitted at the end of body.
      if (inHead) {
        if (tag === 'base')
          baseHref ??= attrs.href
        if (tag === 'link' && attrs.rel?.toLowerCase().split(/\s+/).includes('canonical'))
          canonical ??= attrs.href
        if (tag === 'meta' && attrs.name?.toLowerCase() === 'robots' && attrs.content)
          robots = robots ? `${robots}, ${attrs.content}` : attrs.content
      }
      if (tag === 'script' && attrs.type?.toLowerCase().split(';')[0].trim() === 'application/ld+json') {
        captureSchema = true
        schemaText = ''
      }
    },
    ontext(text) {
      if (captureSchema)
        schemaText += text
    },
    onclosetag(tag) {
      if (captureSchema && tag === 'script') {
        captureSchema = false
        schema.push(schemaText)
      }
      if ((tag === 'template' || tag === 'noscript') && inertDepth)
        inertDepth--
      if (tag === 'head')
        inHead = false
    },
  })
  parser.end(html)

  const parsedDocBase = baseHref ? URL.parse(baseHref, FALLBACK_BASE) : null
  const docBase = parsedDocBase && (parsedDocBase.protocol === 'http:' || parsedDocBase.protocol === 'https:')
    ? parsedDocBase.href
    : FALLBACK_BASE
  const parsedCanonical = canonical?.trim() ? URL.parse(canonical.trim(), docBase) : null
  const validCanonical = parsedCanonical && (parsedCanonical.protocol === 'http:' || parsedCanonical.protocol === 'https:')
    ? parsedCanonical
    : null
  const canonicalUrl = validCanonical ? normalizeParsedUrl(validCanonical) : undefined
  const parsedSchemaBase = validCanonical
    ? (baseHref ? URL.parse(baseHref, validCanonical) : validCanonical)
    : parsedDocBase
  const schemaBase = parsedSchemaBase && (parsedSchemaBase.protocol === 'http:' || parsedSchemaBase.protocol === 'https:')
    ? parsedSchemaBase.href
    : (validCanonical?.href ?? docBase)
  const lastmod = lastmodFromSchemas(schema, canonicalUrl, schemaBase)
  return { canonical, baseHref, robots, lastmod }
}

const PAGE_SCHEMA_TYPES = new Set([
  'WebPage',
  'Article',
  'BlogPosting',
  'NewsArticle',
  'TechArticle',
  'ScholarlyArticle',
  'Report',
  'CollectionPage',
  'ItemPage',
  'AboutPage',
  'ContactPage',
  'FAQPage',
  'ProfilePage',
  'SearchResultsPage',
])

function normalizeParsedUrl(parsed: URL): string {
  const pathname = parsed.pathname.length > 1 ? parsed.pathname.replace(/\/+$/, '') : parsed.pathname
  return `${parsed.origin}${pathname}${parsed.search}`
}

function normalizeComparableUrl(raw: string, base = FALLBACK_BASE): string | undefined {
  const trimmed = raw.trim()
  if (!trimmed || trimmed.startsWith('_:'))
    return
  const parsed = URL.parse(trimmed, base)
  if (!parsed || (parsed.protocol !== 'http:' && parsed.protocol !== 'https:'))
    return
  return normalizeParsedUrl(parsed)
}

function normalizeSchemaId(raw: string, base = FALLBACK_BASE): string | undefined {
  const trimmed = raw.trim()
  if (!trimmed)
    return
  if (trimmed.startsWith('_:'))
    return trimmed
  const parsed = URL.parse(trimmed, base)
  if (!parsed || (parsed.protocol !== 'http:' && parsed.protocol !== 'https:'))
    return trimmed
  const pathname = parsed.pathname.length > 1 ? parsed.pathname.replace(/\/+$/, '') : parsed.pathname
  return `${parsed.origin}${pathname}${parsed.search}${parsed.hash}`
}

function collectSchemaNodes(value: unknown, out: Record<string, unknown>[] = []): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    for (const item of value)
      collectSchemaNodes(item, out)
  }
  else if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (Array.isArray(record['@graph']))
      collectSchemaNodes(record['@graph'], out)
    if ('@type' in record || !Array.isArray(record['@graph']))
      out.push(record)
  }
  return out
}

function isPageSchemaNode(node: Record<string, unknown>): boolean {
  const rawTypes = Array.isArray(node['@type']) ? node['@type'] : [node['@type']]
  return rawTypes.some((type) => {
    if (typeof type !== 'string')
      return false
    const normalized = type.trim().replace(/^https?:\/\/schema\.org\//i, '')
    return PAGE_SCHEMA_TYPES.has(normalized)
  })
}

function resolveSchemaIdRef(
  ref: string,
  nodesById: Map<string, Record<string, unknown>[]>,
  base: string,
  visited: Set<Record<string, unknown>>,
): string | undefined {
  const trimmed = ref.trim()
  if (!trimmed)
    return
  const normalizedId = normalizeSchemaId(trimmed, base)
  if (normalizedId) {
    for (const target of nodesById.get(normalizedId) || []) {
      if (!visited.has(target)) {
        const resolved = getNodeDocumentUrl(target, nodesById, base, visited)
        if (resolved)
          return resolved
      }
    }
  }
  if (!trimmed.startsWith('#'))
    return normalizeComparableUrl(trimmed, base)
}

function getNodeDocumentUrl(
  node: Record<string, unknown>,
  nodesById: Map<string, Record<string, unknown>[]>,
  base = FALLBACK_BASE,
  visited = new Set<Record<string, unknown>>(),
): string | undefined {
  if (visited.has(node))
    return
  visited.add(node)

  if (typeof node.url === 'string' && node.url.trim()) {
    const url = normalizeComparableUrl(node.url, base)
    if (url)
      return url
  }

  const mains = Array.isArray(node.mainEntityOfPage) ? node.mainEntityOfPage : [node.mainEntityOfPage]
  for (const main of mains) {
    if (typeof main === 'string') {
      const url = resolveSchemaIdRef(main, nodesById, base, visited)
      if (url)
        return url
    }
    else if (main && typeof main === 'object') {
      const mainRecord = main as { 'url'?: unknown, '@id'?: unknown }
      if (typeof mainRecord.url === 'string' && mainRecord.url.trim()) {
        const url = normalizeComparableUrl(mainRecord.url, base)
        if (url)
          return url
      }
      if (typeof mainRecord['@id'] === 'string') {
        const url = resolveSchemaIdRef(mainRecord['@id'], nodesById, base, visited)
        if (url)
          return url
      }
    }
  }

  if (typeof node['@id'] === 'string' && node['@id'].trim() && !node['@id'].trim().startsWith('#'))
    return normalizeComparableUrl(node['@id'], base)
}

function pickLatestDate(nodes: Record<string, unknown>[]): string | undefined {
  let modified = ''
  let published = ''
  for (const node of nodes) {
    const nextModified = schemaDate(node.dateModified)
    const nextPublished = schemaDate(node.datePublished)
    if (nextModified && nextModified > modified)
      modified = nextModified
    if (nextPublished && nextPublished > published)
      published = nextPublished
  }
  return modified || published || undefined
}

function lastmodFromSchemas(schemas: string[], canonicalUrl?: string, schemaBase = FALLBACK_BASE): string | undefined {
  const nodes: Record<string, unknown>[] = []
  for (const json of schemas) {
    let data: unknown
    try {
      data = JSON.parse(json)
    }
    catch {
      continue
    }
    collectSchemaNodes(data, nodes)
  }

  const nodesById = new Map<string, Record<string, unknown>[]>()
  for (const node of nodes) {
    if (typeof node['@id'] !== 'string')
      continue
    const id = normalizeSchemaId(node['@id'], schemaBase)
    if (!id)
      continue
    const list = nodesById.get(id)
    if (list)
      list.push(node)
    else
      nodesById.set(id, [node])
  }

  const pageNodes = nodes.filter(isPageSchemaNode)
  const matched: Record<string, unknown>[] = []
  const unscoped: Record<string, unknown>[] = []
  for (const node of pageNodes) {
    const nodeUrl = getNodeDocumentUrl(node, nodesById, schemaBase)
    if (canonicalUrl && nodeUrl) {
      if (nodeUrl === canonicalUrl)
        matched.push(node)
    }
    else {
      unscoped.push(node)
    }
  }
  return pickLatestDate(matched) || pickLatestDate(unscoped)
}

function readStylesheetHrefs(html: string) {
  const stylesheets = new Set<string>()
  visitHeadTags(html, (tag, attrs) => {
    if (tag !== 'link' || attrs.rel?.trim().toLowerCase() !== 'stylesheet' || !attrs.href)
      return
    // A conditional stylesheet cannot replace the unconditional manifest link.
    const media = attrs.media?.trim().toLowerCase()
    const type = attrs.type?.trim().toLowerCase()
    if (attrs.disabled === undefined && !attrs.title && (!media || media === 'all') && (!type || type === 'text/css'))
      stylesheets.add(attrs.href)
  })
  return stylesheets
}

/**
 * Generate preload link tags from the SSR manifest.
 */
export function renderPreloadLinks(modules: Set<string> | undefined, manifest: Record<string, string[]>, template?: string): string {
  if (!modules || modules.size === 0)
    return ''

  const seen = new Set<string>()
  const links: string[] = []
  let templateStylesheets: Set<string> | undefined

  for (const id of modules) {
    const files = manifest[id]
    if (!files)
      continue
    for (const file of files) {
      if (seen.has(file))
        continue
      seen.add(file)

      if (file.endsWith('.js') || file.endsWith('.mjs')) {
        links.push(`<link rel="modulepreload" crossorigin href="${file}">`)
      }
      else if (file.endsWith('.css')) {
        templateStylesheets ??= readStylesheetHrefs(template ?? '')
        if (!templateStylesheets.has(file))
          links.push(`<link rel="stylesheet" href="${file}">`)
      }
      else if (file.endsWith('.woff') || file.endsWith('.woff2')) {
        // The shared KaTeX stylesheet lists every font family and format in
        // the SSR manifest, even on pages without math. Let CSS select only
        // the fonts actually used, including in excerpts and after navigation.
        if (/(?:^|\/)KaTeX_[^/]+$/.test(file))
          continue
        links.push(`<link rel="preload" href="${file}" as="font" type="font/${file.endsWith('.woff2') ? 'woff2' : 'woff'}" crossorigin>`)
      }
      else if (file.endsWith('.gif') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.webp') || file.endsWith('.svg') || file.endsWith('.avif')) {
        links.push(`<link rel="preload" href="${file}" as="image">`)
      }
    }
  }

  return links.length > 0 ? `${links.join('\n')}\n` : ''
}

/**
 * Serialise initial state to a `<script>` tag for client-side hydration.
 */
export function serializeState(state: Record<string, any>): string {
  if (!state || Object.keys(state).length === 0)
    return ''

  const serialised = JSON.stringify(state)
    .replace(/\\/g, '\\\\')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

  return `<script>window.__INITIAL_STATE__='${serialised}'</script>`
}

function decodePathSegment(segment: string): string {
  try {
    return decodeURIComponent(segment)
  }
  catch {
    return segment
  }
}

/**
 * Convert a route path to a file name.
 * e.g. `/` → `index.html`, `/about` → `about.html`, `/posts/` → `posts/index.html`
 *
 * Route paths are percent-encoded (`/posts/%E4%B8%AD`), but static servers decode
 * the request path before looking up the file, so the file name must be decoded
 * (`posts/中.html`).
 */
export function routeToFileName(route: string): string {
  route = route.split('/').map(decodePathSegment).join('/')

  if (route.endsWith('/'))
    return `${route}index.html`.slice(1)

  if (route.endsWith('.html'))
    return route.slice(1)

  return `${route}.html`.slice(1)
}

/**
 * `posts/hello.html` also needs `posts/hello/index.html` so `/posts/hello/`
 * resolves on static hosts that map a trailing slash to a directory index.
 * Directory routes (`/posts/` → `posts/index.html`) already have that file.
 */
export function trailingSlashAlias(route: string): string | undefined {
  if (!route || route.endsWith('/') || isNotFoundPagePath(route))
    return

  const file = routeToFileName(route)
  if (!file.endsWith('.html') || file.endsWith('/index.html'))
    return

  return `${file.slice(0, -'.html'.length)}/index.html`
}

async function fileExists(file: string) {
  try {
    await access(file, constants.F_OK)
    return true
  }
  catch {
    return false
  }
}

/**
 * Copy each extensionless page onto its trailing-slash path.
 * Skip not-found documents so hosts can use `404.html` as an error response
 * without also getting a normal directory index for `/404/`.
 */
export async function writeTrailingSlashAliases(outDir: string, routes: string[]) {
  const outputs = new Set(routes.map(routeToFileName))
  await pMap(routes, async (route) => {
    const alias = trailingSlashAlias(route)
    if (!alias || outputs.has(alias))
      return

    const from = resolve(outDir, routeToFileName(route))
    const to = resolve(outDir, alias)
    if (!await fileExists(from) || await fileExists(to))
      return

    await mkdir(dirname(to), { recursive: true })
    await copyFile(from, to)
  }, { concurrency: 32 })
}
