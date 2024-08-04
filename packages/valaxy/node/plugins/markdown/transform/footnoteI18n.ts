/**
 * Transforms ValaxyFootnoteRef, ValaxyFootnoteItem, ValaxyFootnoteAnchor for I18n purposes
 */
export function transformFootnoteI18n(code: string) {
  const refLanguages: Map<string, string> = new Map()
  // Scan for footnote references within specific languages
  for (const match of code.matchAll(/<div lang="(.*?)">(.*?)<\/div>/gs)) {
    const [_, lang, content] = match
    for (const footnoteRef of content.matchAll(/<ValaxyFootnoteRef(?:.*?)id="(.*?)">(?:.*?)<\/ValaxyFootnoteRef>/gs)) {
      const [_, id] = footnoteRef
      refLanguages.set(id, lang)
    }
  }
  // Scan for footnote references without language specification
  for (const footnoteRef of code.matchAll(/<ValaxyFootnoteRef(?:.*?)id="(.*?)">(?:.*?)<\/ValaxyFootnoteRef>/gs)) {
    const [_, id] = footnoteRef
    if (!(refLanguages.has(id)))
      refLanguages.set(id, 'ALL')
  }
  // Write language spans to footnote items
  let itemIndex = 0
  return code.replace(/<ValaxyFootnoteItem(.*?)>(.*?)<\/ValaxyFootnoteItem>/gs, (_, meta: string, content: string) => {
    itemIndex++

    const itemLanguages = new Set()
    // Pin index of footnote list item
    content = content.replace(/<li (.*?)>/, (_, rest) => `<li value="${itemIndex}" ${rest}>`)
      .replace(/<ValaxyFootnoteAnchor href="#(.*?)">(.*?)<\/ValaxyFootnoteAnchor>/gs, (v, href, anchor) => {
        const lang = refLanguages.get(href)!
        itemLanguages.add(lang)
        if (lang === 'ALL')
          return v
        return `<ValaxyFootnoteAnchor href="#${href}"><span lang="${lang}">${anchor}</span></ValaxyFootnoteAnchor>`
      })
    if (itemLanguages.has('ALL'))
      return `<ValaxyFootnoteItem${meta}>${content}</ValaxyFootnoteItem>`
    // make a copy for each language
    return `<ValaxyFootnoteItem${meta}>${Array.from(itemLanguages).map(lang => `<span lang="${lang}">${content}</span>`).join('')}</ValaxyFootnoteItem>`
  })
}
