import { describe, expect, it } from 'vitest'

/**
 * resolveCollectionItemHref logic
 * Mirrors packages/valaxy/client/composables/collections.ts
 */
function resolveCollectionItemHref(collectionKey: string, item: { key?: string, link?: string }): { href: string, isExternal: boolean } {
  if (item.link) {
    const isExternal = /^https?:\/\//.test(item.link)
    return { href: item.link, isExternal }
  }
  if (item.key)
    return { href: `/collections/${collectionKey}/${item.key}`, isExternal: false }
  return { href: '', isExternal: false }
}

/**
 * extractConfigItems logic
 * Mirrors packages/devtools/src/node/functions.ts
 */
function extractConfigItems(content: string): { key?: string, title?: string, link?: string }[] {
  const items: { key?: string, title?: string, link?: string }[] = []
  const itemsMatch = content.match(/items\s*:\s*\[([^\]]*)\]/)
  if (!itemsMatch)
    return items

  const itemsContent = itemsMatch[1]
  const objectRegex = /\{([^}]*)\}/g
  let objMatch: RegExpExecArray | null
  // eslint-disable-next-line no-cond-assign
  while ((objMatch = objectRegex.exec(itemsContent)) !== null) {
    const block = objMatch[1]
    const keyMatch = block.match(/key\s*:\s*['"`]([^'"`]*)['"`]/)
    const titleMatch = block.match(/title\s*:\s*['"`]([^'"`]*)['"`]/)
    const linkMatch = block.match(/link\s*:\s*['"`]([^'"`]*)['"`]/)
    items.push({
      key: keyMatch?.[1],
      title: titleMatch?.[1],
      link: linkMatch?.[1],
    })
  }
  return items
}

describe('resolveCollectionItemHref', () => {
  it('resolves key-based item to collection path', () => {
    const result = resolveCollectionItemHref('hamster', { key: '1' })
    expect(result).toEqual({ href: '/collections/hamster/1', isExternal: false })
  })

  it('resolves external link item', () => {
    const result = resolveCollectionItemHref('hamster', { link: 'https://valaxy.site' })
    expect(result).toEqual({ href: 'https://valaxy.site', isExternal: true })
  })

  it('resolves http link as external', () => {
    const result = resolveCollectionItemHref('hamster', { link: 'http://example.com' })
    expect(result).toEqual({ href: 'http://example.com', isExternal: true })
  })

  it('resolves internal link item (starting with /)', () => {
    const result = resolveCollectionItemHref('hamster', { link: '/posts/hello-valaxy' })
    expect(result).toEqual({ href: '/posts/hello-valaxy', isExternal: false })
  })

  it('link takes precedence over key', () => {
    const result = resolveCollectionItemHref('hamster', { key: '1', link: 'https://example.com' })
    expect(result).toEqual({ href: 'https://example.com', isExternal: true })
  })

  it('returns empty href when neither key nor link is set', () => {
    const result = resolveCollectionItemHref('hamster', {})
    expect(result).toEqual({ href: '', isExternal: false })
  })

  it('handles string key with slug', () => {
    const result = resolveCollectionItemHref('hamster', { key: 'to-be-or-not-to-be' })
    expect(result).toEqual({ href: '/collections/hamster/to-be-or-not-to-be', isExternal: false })
  })
})

describe('extractConfigItems', () => {
  it('extracts key-only items', () => {
    const content = `
export default defineCollection({
  items: [
    { title: 'Chapter 1', key: '1' },
    { title: 'Chapter 2', key: '2' },
  ],
})`
    const items = extractConfigItems(content)
    expect(items).toEqual([
      { key: '1', title: 'Chapter 1', link: undefined },
      { key: '2', title: 'Chapter 2', link: undefined },
    ])
  })

  it('extracts link-only items', () => {
    const content = `
export default defineCollection({
  items: [
    { title: 'External Ref', link: 'https://valaxy.site' },
  ],
})`
    const items = extractConfigItems(content)
    expect(items).toEqual([
      { key: undefined, title: 'External Ref', link: 'https://valaxy.site' },
    ])
  })

  it('extracts mixed key and link items', () => {
    const content = `
export default defineCollection({
  items: [
    { title: 'Chapter 1', key: '1' },
    { title: 'Valaxy Site', link: 'https://valaxy.site' },
    { title: 'Chapter 2', key: '2' },
    { title: 'Related Post', link: '/posts/hello' },
  ],
})`
    const items = extractConfigItems(content)
    expect(items).toHaveLength(4)
    expect(items[0]).toEqual({ key: '1', title: 'Chapter 1', link: undefined })
    expect(items[1]).toEqual({ key: undefined, title: 'Valaxy Site', link: 'https://valaxy.site' })
    expect(items[2]).toEqual({ key: '2', title: 'Chapter 2', link: undefined })
    expect(items[3]).toEqual({ key: undefined, title: 'Related Post', link: '/posts/hello' })
  })

  it('returns empty array when no items found', () => {
    const content = `export default defineCollection({ title: 'Test' })`
    expect(extractConfigItems(content)).toEqual([])
  })

  it('handles double-quoted strings', () => {
    const content = `
export default defineCollection({
  items: [
    { title: "Chapter 1", key: "1" },
  ],
})`
    const items = extractConfigItems(content)
    expect(items).toEqual([
      { key: '1', title: 'Chapter 1', link: undefined },
    ])
  })

  it('preserves item order from config', () => {
    const content = `
export default defineCollection({
  items: [
    { key: '3', title: 'Third' },
    { key: '1', title: 'First' },
    { key: '2', title: 'Second' },
  ],
})`
    const items = extractConfigItems(content)
    expect(items.map(i => i.key)).toEqual(['3', '1', '2'])
  })
})
