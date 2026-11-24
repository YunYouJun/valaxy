export interface PublicAuthor {
  name?: string
  email?: string
  link?: string
}

/**
 * Author fields safe to publish on a site that did not set them.
 * Empty email and link are omitted. Callers pass the resolved site author,
 * so an address the site set explicitly is kept.
 */
export function publicAuthor(author: { name?: string, email?: string, link?: string } | undefined): PublicAuthor {
  const result: PublicAuthor = {}
  const name = author?.name?.trim()
  const email = author?.email?.trim()
  const link = author?.link?.trim()
  if (name)
    result.name = name
  if (email)
    result.email = email
  if (link)
    result.link = link
  return result
}

/** Open Graph type for a Valaxy route. Posts are articles; other pages stay websites. */
export function openGraphType(path: string, layout?: string | false): 'article' | 'website' {
  if (layout === 'post')
    return 'article'
  const normalized = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
  return /^\/posts\/.+/.test(normalized) ? 'article' : 'website'
}

const SHARE_IMAGE = /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp)$/i

/** Generated index pages such as `/page/1` and `/page/2`. These are slices of the post list. */
export function isGeneratedPaginationPath(path: string): boolean {
  const normalized = path.length > 1 ? path.replace(/\/+$/, '') : path
  return /^\/page\/[1-9]\d*$/.test(normalized)
}

/** Generated pagination pages beyond page 1 (`/page/2`, `/page/3`, ...). */
export function isNoindexPaginationPath(path: string): boolean {
  const normalized = path.length > 1 ? path.replace(/\/+$/, '') : path
  return /^\/page\/(?:[2-9]\d*|1\d+)$/.test(normalized)
}

/**
 * Absolute schema node id. `https://example.com/blog/` + `identity`
 * becomes `https://example.com/blog/#identity`, matching Unhead's host ids.
 */
export function schemaNodeId(siteUrl: string, fragment: string): string | undefined {
  if (!/^https?:\/\//i.test(siteUrl))
    return
  const id = fragment.replace(/^#/, '')
  if (!id)
    return
  try {
    return new URL(`#${id}`, `${siteUrl.replace(/\/+$/, '')}/`).href
  }
  catch {
    return undefined
  }
}

/** ISO-8601 timestamp for JSON-LD and sitemap lastmod. Invalid values are omitted. */
export function schemaDate(value: unknown): string | undefined {
  if (value == null || value === '')
    return
  const date = value instanceof Date ? value : new Date(value as string | number)
  if (Number.isNaN(date.getTime()))
    return
  return date.toISOString()
}

export interface BreadcrumbItem {
  name: string
  item: string
}

export interface BreadcrumbAncestor {
  path: string
  name?: string
}

/**
 * Home, existing parent routes, then the current page.
 * Pagination and the site root are omitted: they are not extra documents.
 */
export function buildBreadcrumbItems(input: {
  siteUrl: string
  siteTitle: string
  pageTitle: string
  path: string
  resolveAncestor?: (path: string) => BreadcrumbAncestor | undefined
}): BreadcrumbItem[] | undefined {
  if (!/^https?:\/\//i.test(input.siteUrl))
    return

  const path = input.path.startsWith('/') ? input.path : `/${input.path}`
  const trimmed = path.length > 1 ? path.replace(/\/+$/, '') : path
  if (trimmed === '/' || isGeneratedPaginationPath(trimmed))
    return

  const segments = trimmed.split('/').filter(Boolean)
  if (!segments.length)
    return

  const siteTitle = input.siteTitle.trim() || 'Home'
  const pageTitle = input.pageTitle.trim() || humanizeSegment(segments.at(-1)!)
  const items: BreadcrumbItem[] = [{ name: siteTitle, item: absoluteSiteUrl(input.siteUrl, '/') }]
  for (let index = 0; index < segments.length - 1; index++) {
    const ancestorPath = `/${segments.slice(0, index + 1).join('/')}`
    const resolved = input.resolveAncestor?.(ancestorPath)
    if (!resolved)
      continue
    items.push({
      name: resolved.name?.trim() || humanizeSegment(segments[index]),
      item: absoluteSiteUrl(input.siteUrl, resolved.path),
    })
  }
  const pagePath = path.endsWith('/') ? `${trimmed}/` : trimmed
  items.push({ name: pageTitle, item: absoluteSiteUrl(input.siteUrl, pagePath) })
  return items.length >= 2 ? items : undefined
}

function absoluteSiteUrl(siteUrl: string, path: string): string {
  return new URL(path.replace(/^\/+/, ''), `${siteUrl.replace(/\/+$/, '')}/`).href
}

function humanizeSegment(segment: string): string {
  let text = segment
  try {
    text = decodeURIComponent(segment)
  }
  catch {}
  return text
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b[a-z]/g, char => char.toUpperCase())
}

/** RSS, Atom, and JSON Feed filenames. An empty `feed.name` keeps the historical defaults. */
export function feedFileNames(name?: string): { atom: string, json: string, rss: string } {
  const base = name?.trim()
  return {
    atom: base ? `${base}.atom` : 'atom.xml',
    json: `${base || 'feed'}.json`,
    rss: `${base || 'feed'}.xml`,
  }
}

/**
 * Readable alt text from an image filename, for Markdown images that have none.
 * Hashes, bare numbers, and very short names are left empty so decorative
 * assets do not become nonsense labels.
 */
export function imageAltFromSrc(src: string): string | undefined {
  const trimmed = src.trim()
  if (!trimmed || /^(?:data|blob|javascript|vbscript):/i.test(trimmed))
    return

  let path = trimmed.split(/[?#]/)[0]
  if (/^(?:https?:)?\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed, 'https://valaxy.local')
      if (!parsed.hostname)
        return
      path = parsed.pathname
    }
    catch {
      return
    }
  }

  const segment = path.split('/').pop() || ''
  if (!segment)
    return

  let base = segment
  try {
    base = decodeURIComponent(base)
  }
  catch {}
  const stem = base.replace(/\.[a-z0-9]{1,8}$/i, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
  const compact = stem.replace(/\s/g, '')
  if (stem.length < 2 || !/\D/.test(compact))
    return
  // Vite content hashes and long hex ids are not descriptions.
  if (/^(?:[\da-f]{8,}|(?=[\da-z]*\d)(?=[\da-z]*[a-z])[\da-z]{12,})$/i.test(compact))
    return
  return stem
}

export function hasImageExtension(pathname: string): boolean {
  return SHARE_IMAGE.test(pathname.split('/').pop() || '')
}

/**
 * First usable share image. The site favicon is not a candidate: it is often an SVG
 * and is the same for every page.
 */
export function pickShareImage(candidates: unknown[]): string | undefined {
  for (const candidate of candidates) {
    const value = typeof candidate === 'string' ? candidate.trim() : ''
    if (!value || Array.from(value).some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127))
      continue
    // Spaces may be part of a quoted HTML src or a real filename. Only remove
    // an actual trailing Markdown title, rather than truncating at whitespace.
    const url = value.startsWith('<')
      ? value.match(/^<([^>]+)>/)?.[1]
      : value.replace(/\s+(?:"[^"]*"|'[^']*'|\([^)]*\))$/, '')
    if (!url || url.includes('\\'))
      continue

    const pathname = url.split(/[?#]/)[0]
    // Components are not image resources; URL schemes must be HTTP(S).
    if (/\.vue$/i.test(pathname) || (/^[a-z][a-z\d+.-]*:/i.test(url) && !/^https?:\/\//i.test(url)))
      continue
    if (/^(?:https?:)?\/\//i.test(url)) {
      try {
        if (new URL(url, 'https://valaxy.local').hostname)
          return url
      }
      catch {}
      continue
    }
    // A path is unambiguous; a bare filename needs a known image extension
    // so PascalCase cover component names do not become broken share URLs.
    if (/^(?:\/|\.\.?\/)/.test(url) || pathname.includes('/') || SHARE_IMAGE.test(pathname))
      return url
  }
}

/** Keep explicit legacy `image` ahead of the cover, as Yun's article schema did. */
export function pickPageShareImage(frontmatter: { ogImage?: unknown, image?: unknown, cover?: unknown, firstImage?: unknown }): string | undefined {
  return pickShareImage([frontmatter.ogImage, frontmatter.image, frontmatter.cover, frontmatter.firstImage])
}

/** Remove private blocks before extracting any public text or image metadata. */
export function stripEncryptedContent(markdown: string): string {
  // Match the encryptor's exact closing marker; a lookalike must not expose the remaining block.
  // Also discard an unterminated block, e.g. an excerpt cut inside encrypted text.
  return markdown.replace(/<!--\s*valaxy-encrypt-start:[\s\S]*?(?:<!-- valaxy-encrypt-end -->|$)/g, '\n')
}

/**
 * Plain-text summary for meta descriptions and share cards.
 * Fenced code, HTML comments, and images are removed. Headings are skipped so the
 * title is not repeated as the description. Longer text is cut on a space when
 * one is near the end, otherwise on the character limit, then marked with an ellipsis.
 */
export function plainSeoDescription(markdown: string, maxLength = 200): string {
  if (!markdown || maxLength <= 0)
    return ''

  let text = stripEncryptedContent(markdown).replace(/\r\n/g, '\n')
  text = text.replace(/```[\s\S]*?```/g, '\n')
  text = text.replace(/~~~[\s\S]*?~~~/g, '\n')
  text = text.replace(/```[\s\S]*$/g, '\n')
  text = text.replace(/~~~[\s\S]*$/g, '\n')
  text = text.replace(/<!--[\s\S]*?-->/g, '\n')
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '\n')
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '\n')
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, '\n')
  text = text.replace(/<[^>]+>/g, ' ')

  const paragraphs: string[] = []
  for (const block of text.split(/\n\s*\n/)) {
    const lines = block.split('\n').map(line => line.trim()).filter(Boolean)
    const prose = lines.filter(line =>
      !/^#{1,6}\s/.test(line)
      && !/^```|^~~~/.test(line)
      && !/^(?:-{3,}|\*{3,}|_{3,})$/.test(line)
      && !line.startsWith(':::')
      && !/^(?:import|export)\s/.test(line),
    )
    const paragraph = prose.map(stripInlineMarkdown).join(' ').replace(/\s+/g, ' ').trim()
    if (!paragraph)
      continue
    paragraphs.push(paragraph)
    if (paragraphs.join(' ').length >= maxLength)
      break
  }

  const combined = paragraphs.join(' ').replace(/\s+/g, ' ').trim()
  if (!combined || combined.length <= maxLength)
    return combined

  const slice = combined.slice(0, maxLength + 1)
  const windowStart = Math.floor(maxLength * 0.6)
  const space = slice.lastIndexOf(' ')
  const end = space >= windowStart ? space : maxLength
  const trimmed = combined.slice(0, end).replace(/[\s,;:]+$/u, '').trim()
  return trimmed ? `${trimmed}…` : ''
}

function stripInlineMarkdown(line: string): string {
  // Code spans and escaped punctuation are literal text, not emphasis delimiters.
  const literals: string[] = []
  const protect = (value: string) => `\u0000${literals.push(value) - 1}\u0000`
  let text = line
    .replace(/(`+)(.*?)\1/g, (_, _fence, code: string) => protect(code))
    .replace(/\\([\\`*_~[\]{}()#+\-.!|>])/g, (_, char: string) => protect(char))
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')

  // Underscores inside identifiers are not Markdown emphasis; spaces around a
  // star (e.g. "2 * 3 * 4") do not form an emphasis pair either.
  for (let depth = 0; depth < 3; depth++) {
    text = text
      .replace(/(?<![\p{L}\p{N}_])(_{1,3})(?=\S)(.+?\S|\S)\1(?![\p{L}\p{N}_])/gu, '$2')
      .replace(/(?<!\*)(\*{1,3})(?=\S)(.+?\S|\S)\1(?!\*)/g, '$2')
      .replace(/~~(?=\S)(.+?\S|\S)~~/g, '$1')
  }

  return text
    .replace(/^>\s?/, '')
    .replace(/^[-*+]\s+/, '')
    .replace(/^\d+\.\s+/, '')
    .replace(/\|/g, ' ')
    .replace(/\0(\d+)\0/g, (_, index: string) => literals[Number(index)])
}

/**
 * First content image, ignoring fenced code and the optional markdown title.
 */
export function extractMarkdownImage(code: string): string | undefined {
  const withoutFence = stripEncryptedContent(code)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
  const markdown = withoutFence.match(/!\[[^\]]*\]\(\s*<?([^\s)>]+)>?/)
  if (markdown)
    return markdown[1]
  const html = withoutFence.match(/<img\s[^>]*?\bsrc=(?:"([^"]+)"|'([^']+)')/i)
  // Markdown's rendered attributes escape URL query separators (and quotes).
  // Decode once: an original literal &amp; remains &amp;, not a second ampersand.
  return (html?.[1] || html?.[2])?.replace(/&(amp|lt|gt|quot|apos|#(?:x[\da-f]+|\d+));/gi, (entity, name: string) => {
    if (name.startsWith('#')) {
      const value = name[1].toLowerCase() === 'x' ? Number.parseInt(name.slice(2), 16) : Number.parseInt(name.slice(1), 10)
      return value > 0 && value <= 0x10FFFF ? String.fromCodePoint(value) : entity
    }
    return ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'' } as Record<string, string>)[name.toLowerCase()]
  })
}
