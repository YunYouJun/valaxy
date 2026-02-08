import { describe, expect, it } from 'vitest'
import { resolveOptions } from '../packages/valaxy/node'
import { createMarkdownRenderer } from '../packages/valaxy/node/plugins/markdown'
import { generateAutoExcerptMd, getExcerptByType } from '../packages/valaxy/node/plugins/vueRouter'
import { fixtureFolder } from './shared'

describe('generateAutoExcerptMd', () => {
  it('strips markdown headings', () => {
    const content = '# Title\n\nHello world.\n\n## Subtitle\n\nMore content here.'
    const result = generateAutoExcerptMd(content, 200)
    expect(result).not.toContain('# Title')
    expect(result).not.toContain('## Subtitle')
    expect(result).toContain('Hello world.')
    expect(result).toContain('More content here.')
  })

  it('truncates content longer than specified length', () => {
    const content = 'A'.repeat(300)
    const result = generateAutoExcerptMd(content, 100)
    expect(result).toBe(`${'A'.repeat(100)}...`)
    expect(result).toHaveLength(103) // 100 + '...'
  })

  it('does not truncate content shorter than or equal to length', () => {
    const content = 'Short content.'
    const result = generateAutoExcerptMd(content, 200)
    expect(result).toBe('Short content.')
  })

  it('returns empty string for heading-only content', () => {
    const content = '# Title\n## Subtitle\n### H3'
    const result = generateAutoExcerptMd(content, 200)
    expect(result).toBe('')
  })

  it('returns empty string for empty content', () => {
    expect(generateAutoExcerptMd('', 200)).toBe('')
    expect(generateAutoExcerptMd('   ', 200)).toBe('')
  })

  it('truncates mixed headings and content at specified length', () => {
    // No headings, pure body text for precise length control
    const content = 'First paragraph. Second paragraph and more text.'
    const result = generateAutoExcerptMd(content, 20)
    expect(result).toBe('First paragraph. Sec...')
  })

  it('handles content with no headings', () => {
    const content = 'Just plain text without any headings.'
    const result = generateAutoExcerptMd(content, 200)
    expect(result).toBe('Just plain text without any headings.')
  })
})

describe('getExcerptByType', async () => {
  const mdIt = await createMarkdownRenderer()

  it('returns rendered HTML for type "html"', () => {
    const result = getExcerptByType('**bold** text', 'html', mdIt)
    expect(result).toContain('<strong>bold</strong>')
    expect(result).toContain('text')
  })

  it('returns raw markdown for type "md"', () => {
    const result = getExcerptByType('**bold** text', 'md', mdIt)
    expect(result).toBe('**bold** text')
  })

  it('returns plain text for type "text"', () => {
    const result = getExcerptByType('**bold** text', 'text', mdIt)
    expect(result).not.toContain('<')
    expect(result).toContain('bold')
    expect(result).toContain('text')
  })

  it('returns raw string for type "ai"', () => {
    const result = getExcerptByType('**bold** text', 'ai', mdIt)
    expect(result).toBe('**bold** text')
  })

  it('returns raw string for unknown type (default branch)', () => {
    const result = getExcerptByType('hello', 'unknown' as any, mdIt)
    expect(result).toBe('hello')
  })

  it('returns empty string for empty excerpt', () => {
    const result = getExcerptByType('', 'html', mdIt)
    expect(result).toBe('')
  })
})

describe('siteConfig.excerpt defaults', async () => {
  const options = await resolveOptions({ userRoot: fixtureFolder.userRoot })
  const { siteConfig } = options.config

  it('has excerpt config with correct defaults', () => {
    expect(siteConfig.excerpt).toBeDefined()
    expect(siteConfig.excerpt.type).toBe('html')
    expect(siteConfig.excerpt.auto).toBe(false)
    expect(siteConfig.excerpt.length).toBe(200)
  })
})
