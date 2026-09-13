import type { MarkdownRenderer } from '../renderer'
import { EXTERNAL_URL_RE } from '../../../../shared'

/**
 * Normalize Markdown image URLs so Vue/Vite can process them as static assets.
 * Root-absolute public URLs are intentionally left unchanged: the Vue asset
 * transform applies Vite's resolved `base` when it emits the final URL.
 *
 * @see https://vitepress.dev/guide/asset-handling
 */
export function imagePlugin(md: MarkdownRenderer) {
  const imageRule = md.renderer.rules.image!

  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const src = token.attrGet('src')
    let url = src === null ? null : String(src)

    if (url && !EXTERNAL_URL_RE.test(url)) {
      if (!/^\.?\//.test(url))
        url = `./${url}`
      token.attrSet('src', decodeURIComponent(url))
    }

    return imageRule(tokens, idx, options, env, self)
  }
}
