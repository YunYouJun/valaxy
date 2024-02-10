import type MarkdownIt from 'markdown-it'
import { defaultCodeTheme } from '../../setup'
import { highlight } from '../highlight'
import type { ResolvedValaxyOptions } from '../../../../options'

/**
 * Escape `{{}}` in code block to prevent Vue interpret it, #99
 */
export function escapeVueInCode(md: string) {
  return md.replace(/{{(.*?)}}/g, '&lbrace;&lbrace;$1&rbrace;&rbrace;')
}

export function setupShiki(mdIt: MarkdownIt, highlight: any) {
  mdIt.options.highlight = (code, lang = 'text', attrs) => {
    return highlight(code, lang, attrs)
  }
}

export async function createMdItShikiPlugin(options?: ResolvedValaxyOptions) {
  const mdOptions = options?.config.markdown || {}
  const theme = mdOptions.theme ?? defaultCodeTheme
  const shikiHighlight = await highlight(theme, mdOptions)

  return function (mdIt: MarkdownIt) {
    setupShiki(mdIt, shikiHighlight)
  }
}
