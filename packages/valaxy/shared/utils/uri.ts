const PROTOCOL_PREFIX_RE = /^(?:[a-z][a-z\d+.-]*:)?\/\//i

/**
 * Safely decode a URI, returning the original string on malformed sequences.
 */
export function safeDecodeURI(uri: string): string {
  try {
    return decodeURI(uri)
  }
  catch {
    return uri
  }
}

/**
 * Safely decode a URI component, returning the original string on malformed sequences.
 */
export function safeDecodeURIComponent(uri: string): string {
  try {
    return decodeURIComponent(uri)
  }
  catch {
    return uri
  }
}

/**
 * Safely parse a URL relative to an optional base, returning null on invalid syntax.
 */
export function safeParseUrl(url: string, base?: string): URL | null {
  try {
    return new URL(url, base)
  }
  catch {
    return null
  }
}

/**
 * Join a Vite base URL and a route path while preserving protocol/relative prefixes and `/` separators.
 */
export function joinBaseUrl(base = '/', routePath = ''): string {
  const normalizedBase = (base || '/').replace(/\\/g, '/')
  const normalizedRoute = routePath.replace(/\\/g, '/').replace(/^\/+/, '')

  const protocolMatch = normalizedBase.match(PROTOCOL_PREFIX_RE)
  if (protocolMatch) {
    const prefix = protocolMatch[0]
    const afterProtocol = normalizedBase.slice(prefix.length)
    const slashIdx = afterProtocol.indexOf('/')
    const authority = slashIdx === -1 ? afterProtocol : afterProtocol.slice(0, slashIdx)
    const basePath = slashIdx === -1 ? '' : afterProtocol.slice(slashIdx).replace(/\/+$/, '')
    const joinedPath = normalizedRoute ? `${basePath}/${normalizedRoute}` : `${basePath || ''}/`
    return `${prefix}${authority}${joinedPath.startsWith('/') ? joinedPath : `/${joinedPath}`}`
  }

  if (normalizedBase.startsWith('./') || normalizedBase === '.') {
    const cleanBase = normalizedBase.replace(/\/+$/, '')
    const prefix = cleanBase === '.' ? './' : `${cleanBase}/`
    return `${prefix}${normalizedRoute}`
  }

  const cleanBasePath = `/${normalizedBase.replace(/^\/+|\/+$/g, '')}`
  if (!normalizedRoute)
    return cleanBasePath === '/' ? '/' : `${cleanBasePath}/`

  return cleanBasePath === '/'
    ? `/${normalizedRoute}`
    : `${cleanBasePath}/${normalizedRoute}`
}

const INDEX_ONLY_SEGMENTS_RE = /^index(?:\/index)*$/

/**
 * Map a route/URL path (e.g. `''`, `'/'`, `'/index'`, `'/posts/hello/'`) to a collision-free
 * raw Markdown href and relative file path.
 * - `''` / `'/'` (`pages/index.md`) -> `/index.md` (`index.md`)
 * - `'/index'` (`pages/index/index.md`) -> `/index/index.md` (`index/index.md`)
 * - `'/index/index'` -> `/index/index/index.md` (`index/index/index.md`)
 * - Other routes keep `${normalized}.md`.
 */
export function urlPathToMarkdownPath(urlPath: string): { href: string, relativeFile: string } {
  const normalized = urlPath.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
  const relativeFile = !normalized
    ? 'index.md'
    : INDEX_ONLY_SEGMENTS_RE.test(normalized)
      ? `${normalized}/index.md`
      : `${normalized}.md`
  return {
    href: `/${relativeFile}`,
    relativeFile,
  }
}
