import debug from 'debug'

const d = debug('valaxy:md')

/**
 * Transforms fake elements ValaxyFootnoteRef, ValaxyFootnoteItem, ValaxyFootnoteAnchor to actual elements
 */
export function transformFootnoteTooltip(code: string) {
  const footnoteContentMap = new Map<string, string>()
  return code.replace(/<ValaxyFootnoteItem id="(.*?)">(.*?)<\/ValaxyFootnoteItem>/gs, (_, id: string, content: string) => {
    // Strip out ValaxyFootnoteAnchor
    d('content', content)
    const tooltipContent = content.match(/<ValaxyFootnoteContent>(.*?)<\/ValaxyFootnoteContent>/s)![1].replace(/<ValaxyFootnoteAnchor>(.*?)<\/ValaxyFootnoteAnchor>/s, '')
    const itemContent = content
      .replace(/<ValaxyFootnoteContent>(.*?)<\/ValaxyFootnoteContent>/s, (_, content) => content)
      .replace(/<ValaxyFootnoteAnchor>(.*?)<\/ValaxyFootnoteAnchor>/s, (_, anchor) => anchor)
    d('tooltipContent', tooltipContent)
    d('itemContent', itemContent)
    footnoteContentMap.set(id, tooltipContent)
    return itemContent
  }).replace(/<ValaxyFootnoteRef href="#(.*?)">(.*?)<\/ValaxyFootnoteRef>/gs, (_, href: string, content: string) => {
    // We attach a Floating Vue Tooltip
    return `<span v-tooltip='${JSON.stringify({ content: footnoteContentMap.get(href), html: true })}'>${content}</span>`
  })
}
