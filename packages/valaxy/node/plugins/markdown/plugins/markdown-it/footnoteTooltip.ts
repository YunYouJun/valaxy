import type { MarkdownRenderer } from '../../renderer'
import { mapRenderResult } from '../async-utils'

export function footnoteTooltipPlugin(md: MarkdownRenderer) {
  const originalFootnoteRef = md.renderer.rules.footnote_ref!
  const originalFootnoteOpen = md.renderer.rules.footnote_open!
  const originalFootnoteClose = md.renderer.rules.footnote_close!
  const originalFootnoteAnchor = md.renderer.rules.footnote_anchor!

  md.renderer.rules.footnote_ref = function (tokens, idx, options, env, self) {
    return mapRenderResult(originalFootnoteRef(tokens, idx, options, env, self), (originalCode) => {
      // here use RegExp to find id="..." since relying on the pattern of id="fn..."/id="fnref..." is not reliable
      const href = originalCode.match(/href="(.*?)"/)![0] // Assume that only 1 href is present
      const id = originalCode.match(/id="(.*?)"/)![0] // Assume that only 1 id is present
      return `<ValaxyFootnoteRef ${href} ${id}>${originalCode}</ValaxyFootnoteRef>`
    })
  }

  md.renderer.rules.footnote_open = function (tokens, idx, options, env, self) {
    return mapRenderResult(originalFootnoteOpen(tokens, idx, options, env, self), (originalOpen) => {
      const id = originalOpen.match(/id="(.*?)"/)![0] // Assume that only 1 id is present
      return `<ValaxyFootnoteItem ${id}>${originalOpen}<ValaxyFootnoteContent>`
    })
  }

  md.renderer.rules.footnote_close = function (tokens, idx, options, env, self) {
    return mapRenderResult(
      originalFootnoteClose(tokens, idx, options, env, self),
      originalClose => `</ValaxyFootnoteContent>${originalClose}</ValaxyFootnoteItem>`,
    )
  }

  md.renderer.rules.footnote_anchor = function (tokens, idx, options, env, self) {
    return mapRenderResult(originalFootnoteAnchor(tokens, idx, options, env, self), (originalCode) => {
      const href = originalCode.match(/href="(.*?)"/)![0] // Assume that only 1 href is present
      return `<ValaxyFootnoteAnchor ${href}>${originalCode}</ValaxyFootnoteAnchor>` // easier to strip out later
    })
  }
}
