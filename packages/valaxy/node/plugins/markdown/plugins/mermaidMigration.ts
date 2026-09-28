import type { ResolvedValaxyOptions } from '../../../types'
import type { MarkdownRenderer } from '../renderer'
import { warnMermaidMigration } from '../../../utils/mermaidMigration'

export function mermaidMigrationPlugin(md: MarkdownRenderer, options?: ResolvedValaxyOptions) {
  const fence = md.renderer.rules.fence!
  let warned = false
  md.renderer.rules.fence = (...args) => {
    const [tokens, index, , env] = args
    const token = tokens[index]
    if (!/^mermaid(?:\s|\{|$)/.test(token.info.trim()))
      return fence(...args)

    if (!warned) {
      warnMermaidMigration(options, env.id || env.path)
      warned = true
    }
    // Keep the source visible without trying to load an unsupported highlighter.
    return `<pre v-pre><code class="language-mermaid">${md.utils.escapeHtml(token.content)}</code></pre>\n`
  }
}
