import type { MarkdownRenderer } from 'valaxy'
import { encode } from 'js-base64'

/** Use parsed fences so quoted examples and nested fences stay untouched. */
export function mermaidMarkdown(md: MarkdownRenderer) {
  const infoByToken = new WeakMap<object, string>()
  // Mermaid's legacy object options are Vue expressions, not HTML attributes.
  // Save them immediately after block parsing, before markdown-it-attrs runs.
  md.core.ruler.after('block', 'valaxy_mermaid_options', (state) => {
    for (const token of state.tokens) {
      if (token.type === 'fence' && /^mermaid(?:\s|\{|$)/.test(token.info.trim())) {
        infoByToken.set(token, token.info.trim())
        token.info = 'mermaid'
      }
    }
  })
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const [tokens, index, , env] = args
    const token = tokens[index]
    const info = infoByToken.get(token) ?? token.info.trim()
    if (!/^mermaid(?:\s|\{|$)/.test(info))
      return fence(...args)

    // Feed/excerpt rendering has no Vue compiler. Preserve readable source there.
    if (!env.id)
      return `<pre><code class="language-mermaid">${md.utils.escapeHtml(token.content)}</code></pre>\n`

    const options = info.slice('mermaid'.length).trim() || '{}'
    return `<ValaxyMermaid code="${encode(token.content.trim(), true)}" v-bind="${md.utils.escapeHtml(options)}" />\n`
  }
}
