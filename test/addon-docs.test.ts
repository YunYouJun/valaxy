import { describe, expect, it } from 'vitest'
import { hasMarkdownInclude } from '../scripts/utils/markdown-include'

describe('addon docs README includes', () => {
  const readmePath = '@/../packages/valaxy-addon-moments/README.md'

  it('accepts include directives with optional line slices', () => {
    expect(hasMarkdownInclude(`<!--@include: ${readmePath}-->`, readmePath)).toBe(true)
    expect(hasMarkdownInclude(`<!-- @include: ${readmePath}{5,} -->`, readmePath)).toBe(true)
    expect(hasMarkdownInclude(`<!--@include: ${readmePath}{5,12}-->`, readmePath)).toBe(true)
  })

  it('rejects prose mentions and different README paths', () => {
    expect(hasMarkdownInclude(`Read ${readmePath} for details.`, readmePath)).toBe(false)
    expect(hasMarkdownInclude('<!--@include: @/../packages/another-addon/README.md-->', readmePath)).toBe(false)
  })
})
