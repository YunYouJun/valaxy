import type MarkdownIt from 'markdown-it'

export function footnoteTooltipPlugin(md: MarkdownIt) {
  const originalFootnoteRef = md.renderer.rules.footnote_ref!
  const originalFootnoteOpen = md.renderer.rules.footnote_open!
  const originalFootnoteClose = md.renderer.rules.footnote_close!
  const originalFootnoteAnchor = md.renderer.rules.footnote_anchor!

  md.renderer.rules.footnote_ref = function (tokens, idx, options, env, self) {
    const originalCode = originalFootnoteRef(tokens, idx, options, env, self)
    // here use RegExp to find id="..." since relying on the pattern of id="fn..."/id="fnref..." is not reliable
    const href = originalCode.match(/href="(.*?)"/)![0] // Assume that only 1 href is present
    return `<ValaxyFootnoteRef href="${href}">${originalCode}</ValaxyFootnoteRef>`
  }

  md.renderer.rules.footnote_open = function (tokens, idx, options, env, self) {
    const originalCode = originalFootnoteOpen(tokens, idx, options, env, self)
    const id = originalCode.match(/id="(.*?)"/)![0] // Assume that only 1 id is present
    return `<ValaxyFootnoteItem id="${id}">${originalCode}`
  }

  md.renderer.rules.footnote_close = function (tokens, idx, options, env, self) {
    const originalCode = originalFootnoteClose(tokens, idx, options, env, self)
    return `${originalCode}</ValaxyFootnoteItem>`
  }

  md.renderer.rules.footnote_anchor = function (tokens, idx, options, env, self) {
    const originalCode = originalFootnoteAnchor(tokens, idx, options, env, self)
    return `<ValaxyFootnoteAnchor>${originalCode}</ValaxyFootnoteAnchor>` // easier to strip out later
  }
}
