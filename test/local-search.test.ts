import { describe, expect, it } from 'vitest'
import { clearHtmlTags, replaceKatexWithSource, splitPageIntoSections } from '../packages/valaxy/node/plugins/localSearchPlugin'

describe('clearHtmlTags', () => {
  it('strips HTML tags from a string', () => {
    expect(clearHtmlTags('<p>Hello <b>world</b></p>')).toBe('Hello world')
  })

  it('collapses multiple whitespace into single space', () => {
    expect(clearHtmlTags('<p>a</p>  \n  <p>b</p>')).toBe('a b')
  })

  it('returns plain text unchanged (except whitespace normalization)', () => {
    expect(clearHtmlTags('plain text')).toBe('plain text')
  })

  it('replaces KaTeX spans with LaTeX source before stripping', () => {
    const katex = '<span class="katex"><span class="katex-html"><span>rendered</span></span><span class="katex-mathml"><math><semantics><annotation encoding="application/x-tex">E = mc^2</annotation></semantics></math></span></span>'
    const result = clearHtmlTags(katex)
    expect(result).toContain('E = mc^2')
    expect(result).not.toContain('katex')
  })
})

describe('replaceKatexWithSource', () => {
  it('returns input unchanged when no KaTeX is present', () => {
    const html = '<p>No math here</p>'
    expect(replaceKatexWithSource(html)).toBe(html)
  })

  it('extracts LaTeX from annotation element', () => {
    const katex = '<span class="katex"><span class="katex-html"><span>x</span></span><span class="katex-mathml"><math><semantics><annotation encoding="application/x-tex">x^2</annotation></semantics></math></span></span>'
    const result = replaceKatexWithSource(katex)
    expect(result.trim()).toBe('x^2')
  })

  it('handles katex-display class', () => {
    const katex = '<span class="katex-display"><span class="katex-html"><span>displayed</span></span><span class="katex-mathml"><math><semantics><annotation encoding="application/x-tex">\\sum_{i=0}^n</annotation></semantics></math></span></span>'
    const result = replaceKatexWithSource(katex)
    expect(result.trim()).toBe('\\sum_{i=0}^n')
  })
})

describe('splitPageIntoSections', () => {
  it('yields sections split by headings', () => {
    const html = '<h2>Title A<a href="#title-a">#</a></h2><p>Content A</p><h2>Title B<a href="#title-b">#</a></h2><p>Content B</p>'
    const sections = [...splitPageIntoSections(html)]
    expect(sections.length).toBe(2)
    expect(sections[0].anchor).toBe('title-a')
    expect(sections[0].titles).toContain('Title A')
    expect(sections[0].text).toContain('Content A')
    expect(sections[1].anchor).toBe('title-b')
    expect(sections[1].text).toContain('Content B')
  })

  it('yields nothing for HTML without headings', () => {
    const sections = [...splitPageIntoSections('<p>No headings</p>')]
    expect(sections).toEqual([])
  })

  it('tracks parent titles for nested heading levels', () => {
    const html = '<h1>H1<a href="#h1">#</a></h1><p>text1</p><h2>H2<a href="#h2">#</a></h2><p>text2</p>'
    const sections = [...splitPageIntoSections(html)]
    expect(sections.length).toBe(2)
    // The h2 section should include H1 as a parent title
    const h2Section = sections[1]
    expect(h2Section.titles).toContain('H1')
    expect(h2Section.titles).toContain('H2')
  })
})
