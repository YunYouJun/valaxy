/**
 * Transforms fake elements ValaxyFootnoteRef, ValaxyFootnoteItem, ValaxyFootnoteAnchor to actual elements
 */
export function transformFootnoteTooltip(code: string) {
  const footnoteContentMap = new Map<string, string>()
  return code.replace(/<ValaxyFootnoteItem id="(.*?)">(.*?)<\/ValaxyFootnoteItem>/gs, (_, id: string, content: string) => {
    // Strip out ValaxyFootnoteAnchor
    const tooltipContent = content.match(/<ValaxyFootnoteContent>(.*?)<\/ValaxyFootnoteContent>/s)![1].replace(/<ValaxyFootnoteAnchor(?:.*?)>(.*?)<\/ValaxyFootnoteAnchor>/gs, '')
    const itemContent = content
      .replace(/<ValaxyFootnoteContent>(.*?)<\/ValaxyFootnoteContent>/gs, (_, content) => content)
      .replace(/<ValaxyFootnoteAnchor(?:.*?)>(.*?)<\/ValaxyFootnoteAnchor>/gs, (_, anchor) => anchor)
    footnoteContentMap.set(id, tooltipContent)
    return itemContent
  }).replace(/<ValaxyFootnoteRef href="#(.*?)"(?:.*?)>(.*?)<\/ValaxyFootnoteRef>/gs, (_, href: string, content: string) => {
    // We attach a Floating Vue Tooltip
    // return `<span v-tooltip='${JSON.stringify({ content: footnoteContentMap.get(href), html: true })}'>${content}</span>`
    return `<ValaxyFootnoteTooltip>${content}<template #popper>${footnoteContentMap.get(href)}</template></ValaxyFootnoteTooltip>`
  })
}
