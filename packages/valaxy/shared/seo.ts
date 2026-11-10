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

const SHARE_IMAGE = /^(?:https?:\/\/|[/.])/i

/**
 * First usable share image. The site favicon is not a candidate: it is often an SVG
 * and is the same for every page.
 */
export function pickShareImage(candidates: Array<string | undefined | null>): string | undefined {
  for (const candidate of candidates) {
    const value = candidate?.trim()
    if (!value || !SHARE_IMAGE.test(value))
      continue
    const url = value.match(/^<?([^\s>]+)>?/)?.[1]
    if (url)
      return url
  }
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

  let text = markdown.replace(/\r\n/g, '\n')
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
  return line
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/^>\s?/, '')
    .replace(/^[-*+]\s+/, '')
    .replace(/^\d+\.\s+/, '')
    .replace(/\|/g, ' ')
}

/**
 * First content image, ignoring fenced code and the optional markdown title.
 */
export function extractMarkdownImage(code: string): string | undefined {
  const withoutFence = code
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
  const markdown = withoutFence.match(/!\[[^\]]*\]\(\s*<?([^\s)>]+)>?/)
  if (markdown)
    return markdown[1]
  const html = withoutFence.match(/<img\s[^>]*?\bsrc=["']([^"']+)["']/i)
  return html?.[1]
}
