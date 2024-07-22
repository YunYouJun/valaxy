/**
 * Transforms fake elements ValaxyFootnoteRef, ValaxyFootnoteItem, ValaxyFootnoteAnchor to actual elements
 */
export function transformFootnoteTooltip(code: string) {
  const footnoteContentMap = new Map<string, string>()
  return code.replace(/<ValaxyFootnoteItem id="(.*?)">(.*?)<\/ValaxyFootnoteItem>/g, (_, id: string, content: string) => {
    // Strip out ValaxyFootnoteAnchor
    const tooltipContent = content.replace(/<ValaxyFootnoteAnchor>(.*?)<\/ValaxyFootnoteAnchor>/g, (_, innerContent: string) => innerContent)
    const itemContent = content.replace(/<ValaxyFootnoteAnchor>(.*?)<\/ValaxyFootnoteAnchor>/g, '')
    footnoteContentMap.set(id, tooltipContent)
    return itemContent
  }).replace(/<ValaxyFootnoteRef href="(.*?)">(.*?)<\/ValaxyFootnoteRef>/g, (_, href: string, content: string) => {
    // We attach a Floating Vue Tooltip
    return `<ValaxyTooltip>${content}<template #popper><div>${footnoteContentMap.get(href)}</div></template></ValaxyTooltip>`
  })
}
