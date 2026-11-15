const NAMED_HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: '\'',
  nbsp: ' ',
  copy: '©',
  reg: '®',
  trade: '™',
  mdash: '—',
  ndash: '–',
  hellip: '…',
  laquo: '«',
  raquo: '»',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
}

let entityDecoderTextarea: HTMLTextAreaElement | undefined

function decodeNumericCodePoint(raw: string, radix: number): string | undefined {
  const code = Number.parseInt(raw, radix)
  if (!Number.isFinite(code) || code <= 0 || code > 0x10FFFF || (code >= 0xD800 && code <= 0xDFFF))
    return undefined
  return String.fromCodePoint(code)
}

function decodeHtmlEntities(text: string): string {
  if (!text.includes('&'))
    return text

  return text.replace(/&(#x[\da-f]+|#\d+|[a-z][\da-z]+);/gi, (match, body: string) => {
    if (body[0] === '#') {
      const isHex = body[1] === 'x' || body[1] === 'X'
      return decodeNumericCodePoint(body.slice(isHex ? 2 : 1), isHex ? 16 : 10) ?? match
    }
    const known = NAMED_HTML_ENTITIES[body]
    if (known)
      return known
    if (typeof document !== 'undefined') {
      entityDecoderTextarea ??= document.createElement('textarea')
      entityDecoderTextarea.innerHTML = match
      return entityDecoderTextarea.value
    }
    return match
  })
}

const ESCAPABLE_PUNCTUATION_RE = /^[-!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~]$/

function findClosingBackticks(text: string, from: number, ticks: number): number {
  let i = from
  while (i < text.length) {
    if (text[i] === '`') {
      let run = 0
      while (i + run < text.length && text[i + run] === '`')
        run++
      if (run === ticks)
        return i
      i += run
    }
    else {
      i++
    }
  }
  return -1
}

function protectCodeAndEscapes(text: string, protect: (value: string) => string): string {
  let result = ''
  let i = 0

  while (i < text.length) {
    const ch = text[i]
    if (ch === '\\' && i + 1 < text.length && ESCAPABLE_PUNCTUATION_RE.test(text[i + 1])) {
      result += protect(text[i + 1])
      i += 2
      continue
    }

    if (ch === '`') {
      let ticks = 0
      while (i + ticks < text.length && text[i + ticks] === '`')
        ticks++

      const closeIdx = findClosingBackticks(text, i + ticks, ticks)
      if (closeIdx !== -1) {
        const rawCode = text.slice(i + ticks, closeIdx)
        const trimmedCode = rawCode.length >= 2
          && rawCode.startsWith(' ')
          && rawCode.endsWith(' ')
          && /[^ ]/.test(rawCode)
          ? rawCode.slice(1, -1)
          : rawCode
        result += protect(trimmedCode)
        i = closeIdx + ticks
        continue
      }

      result += text.slice(i, i + ticks)
      i += ticks
      continue
    }

    result += ch
    i++
  }

  return result
}

/**
 * Convert raw Markdown excerpt text to clean plain text for search results,
 * preserving inline code spans, escaped punctuation, autolinks, and math/comparison prose.
 */
export function formatFuseExcerpt(text = ''): string {
  const literals: string[] = []
  const protect = (value: string) => `\u0000${literals.push(value) - 1}\u0000`
  let cleaned = protectCodeAndEscapes(
    text
      .replace(/\0/g, '')
      .replace(/^[ \t]*```[\s\S]+?^[ \t]*```/gm, ' ')
      .replace(/^[ \t]*~~~[\s\S]+?^[ \t]*~~~/gm, ' '),
    protect,
  )
    .replace(/<!--[\s\S]*?(?:-->|$)/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<((?:https?:\/\/|mailto:)[^>\s]+)>/gi, '$1')
    .replace(/<([^\s<>@]+@[^\s<>@.]+(?:\.[^\s<>@.]+)+)>/g, '$1')
    .replace(/<\/?[a-z][\w:-]*(?:\s[^<>]*)?\/?>/gi, ' ')
    .replace(/^[ \t]*#{1,6}[ \t]+/gm, '')
    .replace(/^[ \t]*>[ \t]?/gm, '')

  for (let depth = 0; depth < 3; depth++) {
    cleaned = cleaned
      .replace(/(?<![\p{L}\p{N}_])(_{1,3})(?=\S)(.+?\S|\S)\1(?![\p{L}\p{N}_])/gu, '$2')
      .replace(/(?<!\*)(\*{1,3})(?=\S)(.+?\S|\S)\1(?!\*)/g, '$2')
      .replace(/~~(?=\S)(.+?\S|\S)~~/g, '$1')
  }

  return decodeHtmlEntities(cleaned)
    .replace(/\0(\d+)\0/g, (_, index: string) => literals[Number(index)])
    .replace(/\s+/g, ' ')
    .trim()
}
