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
