/** Reconcile TypeDoc inheritance links with the Markdown plugin's HTML anchors. */
export function resolveSymbolAnchors(markdown: string, anchors: Map<string, Set<string>>) {
  // Preserve fenced examples and inline code verbatim.
  return markdown.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`+[^`]*`+)/g).map((part, index) => {
    if (index % 2)
      return part
    return part.replace(/\]\((\/[^\s)]*\.md)#([^\s)]+)\)/g, (link, page: string, hash: string) => {
      const symbol = `api-${decodeURIComponent(hash)}`
      return anchors.get(decodeURIComponent(page))?.has(symbol)
        ? `](${page}#${encodeURIComponent(symbol)})`
        : link
    })
  }).join('')
}
