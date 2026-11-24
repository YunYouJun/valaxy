import type { MarkdownRenderer } from '../renderer'
import escapeHtml from 'escape-html'
import { EXTERNAL_URL_RE, safeDecodeURIComponent } from '../../../../shared'
import { imageAltFromSrc } from '../../../../shared/seo'
import { mapRenderResult } from './async-utils'

/**
 * Normalize Markdown image URLs so Vue/Vite can process them as static assets.
 * Root-absolute public URLs are intentionally left unchanged: the Vue asset
 * transform applies Vite's resolved `base` when it emits the final URL.
 *
 * @see https://vitepress.dev/guide/asset-handling
 */
export function imagePlugin(md: MarkdownRenderer, pluginOptions?: { altFallback?: boolean }) {
  const imageRule = md.renderer.rules.image!
  const altFallback = pluginOptions?.altFallback === true

  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const src = token.attrGet('src')
    let url = src === null ? null : String(src)

    if (url && !EXTERNAL_URL_RE.test(url)) {
      if (!/^\.?\//.test(url))
        url = `./${url}`
      token.attrSet('src', safeDecodeURIComponent(url))
    }

    const html = imageRule(tokens, idx, options, env, self)
    if (!altFallback || !url)
      return html
    const alt = imageAltFromSrc(url)
    return mapRenderResult(html, rendered => applyImageAlt(rendered, alt))
  }
}

/** Replace an empty alt. An author-written alt is left unchanged. */
function applyImageAlt(html: string, alt: string | undefined): string {
  if (!alt)
    return html
  const escaped = escapeHtml(alt)
  return html.replace(/<img\b(?:"[^"]*"|'[^']*'|[^>])*>/i, (tag) => {
    const altAttr = /(^|\s)alt=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i
    const match = tag.match(altAttr)
    if (match) {
      const current = match[2] ?? match[3] ?? match[4] ?? ''
      if (current.trim())
        return tag
      return tag.replace(altAttr, (_, prefix: string) => `${prefix}alt="${escaped}"`)
    }
    return tag.replace(/^<img\b/i, prefix => `${prefix} alt="${escaped}"`)
  })
}
