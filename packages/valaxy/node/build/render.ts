import type { Unhead } from 'unhead/server'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { renderSSRHead } from '@unhead/vue/server'

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
  const preloadLinks = renderPreloadLinks(result.modules, opts.ssrManifest)

  // 3. Serialise initial state
  const stateScript = serializeState(result.initialState)

  // 4. Assemble HTML via string replacement
  let html = template

  if (headPayload.htmlAttrs)
    html = html.replace('<html', `<html ${headPayload.htmlAttrs}`)

  if (headPayload.bodyAttrs)
    html = html.replace('<body', `<body ${headPayload.bodyAttrs}`)

  html = html
    .replace('</head>', `${preloadLinks}${headPayload.headTags}\n</head>`)
    .replace(
      '<div id="app"></div>',
      `${headPayload.bodyTagsOpen || ''}<div id="app">${result.html}</div>${stateScript}${headPayload.bodyTags || ''}`,
    )

  // Handle teleported content
  if (result.teleports) {
    for (const [target, content] of Object.entries(result.teleports)) {
      if (target === 'head') {
        html = html.replace('</head>', `${content}\n</head>`)
      }
      else if (target === 'body') {
        html = html.replace('</body>', `${content}\n</body>`)
      }
      else {
        // Custom teleport targets (e.g. #modal-root) can't be resolved
        // without a DOM. Fall back to injecting at end of <body>.
        html = html.replace('</body>', `${content}\n</body>`)
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
}

/**
 * Generate preload link tags from the SSR manifest.
 */
function renderPreloadLinks(modules: Set<string> | undefined, manifest: Record<string, string[]>): string {
  if (!modules || modules.size === 0)
    return ''

  const seen = new Set<string>()
  const links: string[] = []

  for (const id of modules) {
    const files = manifest[id]
    if (!files)
      continue
    for (const file of files) {
      if (seen.has(file))
        continue
      seen.add(file)

      if (file.endsWith('.js')) {
        links.push(`<link rel="modulepreload" crossorigin href="${file}">`)
      }
      else if (file.endsWith('.css')) {
        links.push(`<link rel="stylesheet" href="${file}">`)
      }
      else if (file.endsWith('.woff') || file.endsWith('.woff2')) {
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
function serializeState(state: Record<string, any>): string {
  if (!state || Object.keys(state).length === 0)
    return ''

  const serialised = JSON.stringify(state)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

  return `<script>window.__INITIAL_STATE__='${serialised}'</script>`
}

/**
 * Convert a route path to a file name.
 * e.g. `/` → `index.html`, `/about` → `about.html`, `/posts/` → `posts/index.html`
 */
function routeToFileName(route: string): string {
  if (route.endsWith('/'))
    return `${route}index.html`.slice(1)

  if (route.endsWith('.html'))
    return route.slice(1)

  return `${route}.html`.slice(1)
}
