import { describe, expect, it } from 'vitest'
import { formatFuseExcerpt } from '../../packages/valaxy-theme-press/utils/excerpt'

describe('formatFuseExcerpt', () => {
  it('preserves literal identifiers, punctuation, and comparison prose', () => {
    expect(formatFuseExcerpt('Use `node_modules` with C#; test `a > b` and 2 * 3.')).toBe(
      'Use node_modules with C#; test a > b and 2 * 3.',
    )
    expect(formatFuseExcerpt('2 < 3 and 5 > 4')).toBe('2 < 3 and 5 > 4')
  })

  it('preserves multi-backtick code spans and inline triple-backtick spans', () => {
    expect(formatFuseExcerpt('Use ``<T>`value`` here.')).toBe('Use <T>`value here.')
    expect(formatFuseExcerpt('Use ```literal``` delimiters.')).toBe('Use literal delimiters.')
  })

  it('preserves autolinks while stripping real HTML tags and markdown syntax', () => {
    expect(formatFuseExcerpt('Visit <https://valaxy.site> or contact <support@example.com> for **help**.')).toBe(
      'Visit https://valaxy.site or contact support@example.com for help.',
    )
    expect(formatFuseExcerpt('## Heading\n\n> Quoted _text_ with <span class="tag">HTML</span> and [link](https://example.com).')).toBe(
      'Heading Quoted text with HTML and link.',
    )
  })
})
