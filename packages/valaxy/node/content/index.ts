import type { Options } from 'vue-router/unplugin'
import type { ValaxyNode } from '../types'
import type { ContentCheckResult, ContentDiagnostic, ContentPageInfo, ContentServiceOptions } from './types'
import { readFile, realpath, stat } from 'node:fs/promises'
import matter from 'gray-matter'
import { dirname, isAbsolute, relative, resolve } from 'pathe'
import { createRoutesContext, resolveOptions } from 'vue-router/unplugin'
import { createMarkdownEngine } from '../plugins/markdown/renderer'
import { matterOptions } from '../plugins/markdown/transform/matter'
import { createRouterOptions } from '../plugins/vueRouter'
import { resolveContentLayouts } from './layouts'

export * from './types'

const safeMatterOptions = {
  ...matterOptions,
  engines: {
    ...matterOptions.engines,
    javascript: () => { throw new Error('Executable frontmatter is not supported by content inspection') },
  },
}

interface RouteInfo {
  path: string
  aliases: string[]
  files: string[]
  layout?: string | false
  frontmatter: Record<string, unknown>
}

function inside(root: string, file: string) {
  const path = relative(root, file)
  return path !== '..' && !path.startsWith('../') && !isAbsolute(path)
}

function normalizeRoute(path: string) {
  return new URL(path, 'http://valaxy.local').pathname.replace(/\/$/, '') || '/'
}

function metadata(data: Record<string, unknown>): ContentPageInfo['metadata'] {
  const result: ContentPageInfo['metadata'] = {}
  for (const key of ['title', 'description', 'date', 'updated', 'tags', 'categories', 'draft', 'hide']) {
    const value = data[key]
    if (typeof value === 'string' || typeof value === 'boolean')
      result[key] = typeof value === 'string' ? value.slice(0, 2000) : value
    else if (value instanceof Date && Number.isFinite(value.getTime()))
      result[key] = value.toISOString()
    else if (Array.isArray(value))
      result[key] = value.flat(4).filter(item => typeof item === 'string').slice(0, 50).map(item => item.slice(0, 2000))
  }
  return result
}

/**
 * Inspect Markdown through Valaxy's route pipeline without starting a server.
 * Configured route/Markdown hooks run as they do during route generation. Scans
 * are serialized and rebuilt per request so edits and removals are observable.
 */
export function createContentService(app: ValaxyNode, settings: ContentServiceOptions = {}) {
  const { userRoot, config } = app.options
  const pagesRoot = resolve(userRoot, 'pages')
  const parseMatter = (source: string) => matter(source, safeMatterOptions)
  const routerApp = { ...app, options: { ...app.options, redirects: [] } }
  let routerOptions: Promise<Options> | undefined
  let queue: Promise<unknown> = Promise.resolve()
  let release: (() => void) | undefined
  let disposed = false
  const parser = createMarkdownEngine()

  function visible(data: Record<string, unknown>) {
    if (settings.publicOnly && (data.password || data.encrypt || data.gallery_password || data.hide || (data.draft && !settings.includeDrafts)))
      throw new Error('Page unavailable under the MCP visibility policy.')
  }

  async function read(path: string) {
    if (isAbsolute(path) || !path.startsWith('pages/') || path.includes('\\') || path.split('/').includes('..') || !path.endsWith('.md'))
      throw new Error('Use a site-relative Markdown path beginning with pages/, without parent directory segments.')
    const file = resolve(userRoot, path)
    const [realRoot, realPages, realFile] = await Promise.all([realpath(userRoot), realpath(pagesRoot), realpath(file)])
    if (!inside(realRoot, realPages) || !inside(realPages, realFile))
      throw new Error('Page must stay inside the project pages directory.')
    const info = await stat(realFile)
    if (!info.isFile() || info.size > 1024 * 1024)
      throw new Error('Only Markdown files up to 1 MiB are supported.')
    return { file, raw: await readFile(realFile, 'utf8') }
  }

  async function scanRoutes(): Promise<RouteInfo[]> {
    routerOptions ||= createRouterOptions(routerApp, undefined, parseMatter, (dispose) => {
      release = dispose
    }).catch((error) => {
      release?.()
      release = undefined
      routerOptions = undefined
      throw error
    })
    const options = await routerOptions
    const routes: RouteInfo[] = []
    routerApp.options.redirects.length = 0
    const context = createRoutesContext(resolveOptions({
      ...options,
      root: userRoot,
      dts: false,
      watch: false,
      async beforeWriteFiles(root) {
        await options.beforeWriteFiles?.(root)
        for (const route of root) {
          routes.push({
            path: route.fullPath,
            aliases: route.alias || [],
            files: [...route.components.values()].map(file => resolve(file)),
            layout: typeof route.meta.layout === 'string' || route.meta.layout === false ? route.meta.layout : undefined,
            frontmatter: (route.meta.frontmatter || {}) as Record<string, unknown>,
          })
        }
      },
    }))
    try {
      await context.scanPages(false)
      return routes
    }
    finally {
      context.stopWatcher()
    }
  }

  function project(path: string, file: string, routes: RouteInfo[], data: Record<string, unknown>): ContentPageInfo {
    const matches = routes.filter(route => route.files.includes(file))
    for (const route of matches)
      visible(route.frontmatter)
    const resolved = matches[0]?.frontmatter || data
    const draft = Boolean(resolved.draft)
    const base = settings.base ?? config.vite?.base ?? '/'
    const basePath = new URL(base, 'http://valaxy.local').pathname.replace(/\/$/, '')
    return {
      path,
      routes: matches.map(route => ({
        path: route.path,
        aliases: route.aliases,
        previewPath: `${basePath}${route.path}`,
        layout: route.layout ?? config.layouts?.defaultLayout ?? 'default',
      })),
      metadata: metadata(resolved),
      draft,
      hidden: Boolean(resolved.hide),
      includedInProductionRoutes: matches.some(route => !route.frontmatter.draft),
    }
  }

  function serialized<T>(run: () => Promise<T>): Promise<T> {
    if (disposed)
      return Promise.reject(new Error('Content service has been disposed.'))
    const result = queue.then(run)
    queue = result.catch(() => {})
    return result
  }

  async function inspectPage(path: string): Promise<ContentPageInfo> {
    return serialized(async () => {
      const { raw, file } = await read(path)
      const { data } = parseMatter(raw)
      const merged = { ...config.siteConfig.frontmatter, ...data }
      visible(merged)
      const routes = await scanRoutes()
      return project(path, file, routes, merged)
    })
  }

  async function checkPage(path: string): Promise<ContentCheckResult> {
    return serialized(async () => {
      const { raw, file } = await read(path)
      const diagnostics: ContentDiagnostic[] = []
      const add = (code: string, severity: ContentDiagnostic['severity'], message: string, hint: string, line?: number) => diagnostics.push({ code, severity, message, hint, ...(line ? { line } : {}) })
      const result = (page?: ContentPageInfo): ContentCheckResult => ({ path, ok: !diagnostics.some(d => d.severity === 'error'), ...(page ? { page } : {}), diagnostics: diagnostics.slice(0, 100), totalDiagnostics: diagnostics.length })
      let parsed: ReturnType<typeof parseMatter>
      try {
        parsed = parseMatter(raw)
      }
      catch {
        add('invalid-frontmatter', 'error', 'Frontmatter could not be parsed as data.', 'Check YAML syntax and use YAML or JSON, not executable JavaScript.', 1)
        return result()
      }
      const { data, content } = parsed
      visible({ ...config.siteConfig.frontmatter, ...data })
      const fieldLine = (key: string) => raw.split('\n').findIndex(line => line.startsWith(`${key}:`)) + 1 || 1
      for (const key of ['title', 'description', 'layout']) {
        if (data[key] !== undefined && typeof data[key] !== 'string' && !(key === 'layout' && data[key] === false))
          add('frontmatter-type', 'error', `${key} must be a string${key === 'layout' ? ' or false' : ''}.`, `Correct the ${key} frontmatter field.`, fieldLine(key))
      }
      for (const key of ['draft', 'hide']) {
        if (data[key] !== undefined && typeof data[key] !== 'boolean' && !(key === 'hide' && data[key] === 'index'))
          add('frontmatter-type', 'error', `${key} must be a boolean${key === 'hide' ? ' or "index"' : ''}.`, 'Use unquoted true or false in YAML.', fieldLine(key))
      }
      for (const key of ['date', 'updated']) {
        if (data[key] !== undefined && !(typeof data[key] === 'string' || data[key] instanceof Date))
          add('frontmatter-date', 'error', `${key} must be a date string.`, 'Use an ISO date such as 2026-09-19.', fieldLine(key))
        else if (data[key] !== undefined && !Number.isFinite(new Date(data[key]).getTime()))
          add('frontmatter-date', 'error', `${key} is not a valid date.`, 'Use an ISO date such as 2026-09-19.', fieldLine(key))
      }
      for (const key of ['tags', 'categories']) {
        const value = data[key]
        if (value !== undefined && typeof value !== 'string' && !(Array.isArray(value) && value.flat(4).every(item => typeof item === 'string')))
          add('frontmatter-type', 'error', `${key} must contain strings.`, 'Use a string or an array of strings.', fieldLine(key))
      }

      let routes: RouteInfo[]
      try {
        routes = await scanRoutes()
      }
      catch {
        add('route-resolution-failed', 'error', 'The project route pipeline could not complete.', 'Check frontmatter in other pages and configured route/Markdown hooks; run valaxy dev for full local errors.')
        return result()
      }
      const page = project(path, file, routes, data)
      if (!page.routes.length)
        add('route-missing', 'error', 'This file does not appear in the resolved route tree.', 'Check router exclusions, page overrides and route hooks.')
      const routePaths = new Map<string, Set<RouteInfo>>()
      for (const route of routes) {
        for (const routePath of [route.path, ...route.aliases]) {
          const key = normalizeRoute(routePath.startsWith('/') ? routePath : `${dirname(route.path)}/${routePath}`)
          const owners = routePaths.get(key) || new Set<RouteInfo>()
          if (route.files.length)
            owners.add(route)
          routePaths.set(key, owners)
        }
      }
      for (const route of routes.filter(route => route.files.includes(file))) {
        for (const routePath of [route.path, ...route.aliases]) {
          const key = normalizeRoute(routePath.startsWith('/') ? routePath : `${dirname(route.path)}/${routePath}`)
          if ((routePaths.get(key)?.size || 0) > 1)
            add('route-collision', 'error', `The route or alias ${key} is used by multiple pages.`, 'Choose a unique route path or alias in your route hooks.')
        }
      }

      try {
        const layoutNames = await resolveContentLayouts(app.options)
        for (const layout of new Set(page.routes.map(route => route.layout))) {
          if (layout !== false && !layoutNames.has(layout))
            add('layout-missing', 'warning', `Layout "${layout}" was not found in the configured layout directories.`, 'Provide the layout component or choose an existing layout.', fieldLine('layout'))
        }
      }
      catch {
        add('layout-resolution-failed', 'warning', 'The layout registry could not be inspected.', 'Check layout directories and plugin configuration locally.')
      }

      const publicDir = settings.publicDir ?? (config.vite?.publicDir === false ? false : resolve(userRoot, config.vite?.publicDir || 'public'))
      const exists = async (target: string) => {
        try {
          return (await stat(target)).isFile()
        }
        catch { return false }
      }
      const contentLine = raw.slice(0, raw.length - content.length).split('\n').length - 1
      const tokens = parser.parse(content, {})
      const seen = new Set<string>()
      for (const token of tokens) {
        for (const child of token.children || []) {
          if (child.type !== 'link_open' && child.type !== 'image')
            continue
          const target = child.attrGet(child.type === 'image' ? 'src' : 'href') || ''
          if (!target || target.startsWith('#') || /^(?:[a-z][\w+.-]*:|\/\/)/i.test(target))
            continue
          let url: string
          try {
            url = decodeURIComponent(target.split(/[?#]/)[0])
          }
          catch {
            add('invalid-link', 'error', 'A local link contains invalid URL encoding.', 'Correct the percent-encoded characters.', contentLine + (token.map?.[0] || 0) + 1)
            continue
          }
          const key = `${child.type}:${url}`
          if (seen.has(key))
            continue
          seen.add(key)
          const line = contentLine + (token.map?.[0] || 0) + 1
          const base = new URL(settings.base ?? config.vite?.base ?? '/', 'http://valaxy.local').pathname.replace(/\/$/, '')
          const pathname = base && url.startsWith(`${base}/`) ? url.slice(base.length) : url
          // Preserve URL encoding for router comparisons; decode only when
          // resolving filesystem assets so percent signs are not decoded twice.
          const resolvedUrl = new URL(target.split(/[?#]/)[0], `http://valaxy.local${page.routes[0]?.path || '/'}`).pathname
          const routePath = base && resolvedUrl.startsWith(`${base}/`) ? resolvedUrl.slice(base.length) : resolvedUrl
          let found = false
          let targets: RouteInfo[] = []
          if (child.type === 'link_open') {
            targets = [...(routePaths.get(normalizeRoute(routePath)) || [])]
            found = targets.length > 0
          }
          const source = pathname.startsWith('/') ? resolve(pagesRoot, `.${pathname}`) : resolve(dirname(file), pathname)
          if (!found && child.type === 'link_open' && /\.(?:md|vue)$/.test(source)) {
            targets = routes.filter(route => route.files.includes(source))
            found = targets.length > 0
          }
          if (targets.length && targets.every(route => route.frontmatter.draft) && !page.draft)
            add('link-to-draft', 'warning', `The link ${target} points to a draft route.`, 'Publish the target or remove the link before publishing this page.', line)
          if (!found && !/\.(?:md|vue)$/.test(source) && inside(userRoot, source))
            found = await exists(source)
          if (!found && publicDir && (child.type === 'link_open' || pathname.startsWith('/'))) {
            const asset = resolve(publicDir, `.${child.type === 'link_open' ? decodeURIComponent(routePath) : pathname}`)
            if (inside(publicDir, asset))
              found = await exists(asset)
          }
          if (!found)
            add(child.type === 'image' ? 'missing-image' : 'missing-link', 'warning', `Local ${child.type === 'image' ? 'image' : 'link'} target not found: ${target}`, 'Check the resolved route, source-relative file path or public asset path. Custom runtime routes and asset resolvers are not checked.', line)
        }
      }
      return result(page)
    })
  }

  async function dispose() {
    disposed = true
    await queue
    release?.()
    release = undefined
  }

  return { inspectPage, checkPage, dispose }
}
