const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;',
}

const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])
const SAFE_DATA_IMAGE_RE = /^data:image\/(?:png|jpe?g|gif|webp|avif|x-icon|vnd\.microsoft\.icon|svg\+xml)[;,]/i

function stripControlsAndSpaces(value: string): string {
  let out = ''
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    if (code > 0x20 && code !== 0x7F)
      out += value[i]
  }
  return out
}

function hasControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    if (code <= 0x1F || code === 0x7F)
      return true
  }
  return false
}

/**
 * Escape HTML special characters for safe interpolation into HTML text and quoted attributes.
 */
export function escapeHtml(str = ''): string {
  return str.replace(/[&<>"']/g, ch => HTML_ESCAPE_MAP[ch])
}

/**
 * Serialize a string as an inline JavaScript string literal safe inside `<script>` tags.
 */
export function serializeInlineJsString(value: string): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027')
    .replace(/\//g, '\\u002f')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export interface SanitizeUrlOptions {
  /**
   * Allow `data:image/...` URIs (intended for `<link rel="icon">` / image metadata, not navigation links).
   */
  allowDataImage?: boolean
}

/**
 * Sanitize a URL so dangerous schemes like `javascript:`, `vbscript:`, or `data:text/html` cannot execute.
 */
export function sanitizeUrl(url?: string, fallback = '#', options: SanitizeUrlOptions = {}): string {
  if (!url)
    return fallback

  const trimmed = url.trim()
  if (!trimmed || hasControlChars(trimmed))
    return fallback

  const normalized = stripControlsAndSpaces(trimmed)
  if (!normalized)
    return fallback

  if (options.allowDataImage && SAFE_DATA_IMAGE_RE.test(normalized))
    return trimmed

  const schemeMatch = normalized.match(/^([a-z][a-z\d+.-]*):/i)
  if (schemeMatch && !SAFE_URL_PROTOCOLS.has(`${schemeMatch[1].toLowerCase()}:`))
    return fallback

  return trimmed
}
