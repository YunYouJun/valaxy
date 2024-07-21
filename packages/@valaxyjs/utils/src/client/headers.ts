import type { MenuItem } from '../types'

export interface GetHeadersOptions {
  range?: number | [number, number] | 'deep'
  selector?: string
  filter?: (el: Element) => boolean
}

export function groupHeaders(headers: MenuItem[], levelsRange: [number, number]) {
  const result: MenuItem[] = []

  headers = headers.map(h => ({ ...h }))
  headers.forEach((h, index) => {
    if (h.level >= levelsRange[0] && h.level <= levelsRange[1]) {
      if (addToParent(index, headers, levelsRange))
        result.push(h)
    }
  })

  return result
}

export function addToParent(
  currIndex: number,
  headers: MenuItem[],
  levelsRange: [number, number],
) {
  if (currIndex === 0)
    return true

  const currentHeader = headers[currIndex]
  for (let index = currIndex - 1; index >= 0; index--) {
    const header = headers[index]

    if (
      header.level < currentHeader.level
      && header.level >= levelsRange[0]
      && header.level <= levelsRange[1]
    ) {
      if (header.children == null)
        header.children = []
      header.children.push(currentHeader)
      return false
    }
  }

  return true
}

export function resolveHeaders(
  headers: MenuItem[],
  levelsRange: GetHeadersOptions['range'] = [2, 4],
) {
  const levels: [number, number]
    = typeof levelsRange === 'number'
      ? [levelsRange, levelsRange]
      : levelsRange === 'deep'
        ? [2, 6]
        : levelsRange

  return groupHeaders(headers, levels)
}

export function serializeHeader(h: Element): string {
  let ret = ''
  for (const node of Array.from(h.childNodes)) {
    if (node.nodeType === 1) {
      if (
        (node as Element).classList.contains('VABadge')
        || (node as Element).classList.contains('header-anchor')
      )
        continue

      ret += node.textContent
    }
    else if (node.nodeType === 3) {
      ret += node.textContent
    }
  }
  return ret.trim()
}

// el => el.id && el.hasChildNodes()
/**
 * get headers from document directly
 */
export function getHeaders(options: GetHeadersOptions = {
  range: [2, 4],
  selector: '.markdown-body',
}) {
  const mdBodySelector = options.selector || '.markdown-body'
  // when transition, the markdown-body will be two
  // the first is the old one, the last is the new one
  const markdownBodyElements = document.querySelectorAll(mdBodySelector) as NodeListOf<HTMLElement>
  const markdownBody = markdownBodyElements[markdownBodyElements.length - 1]
  const headers = Array.from(markdownBody.querySelectorAll(`${mdBodySelector} :where(h1,h2,h3,h4,h5,h6)`))
    .filter(el => options.filter ? options.filter(el) : true)
    .map((el) => {
      const level = Number(el.tagName[1])
      return {
        title: serializeHeader(el),
        link: `#${el.id}`,
        level,
        // @ts-expect-error lang
        lang: el.lang,
      }
    })

  return resolveHeaders(headers, options.range)
}
