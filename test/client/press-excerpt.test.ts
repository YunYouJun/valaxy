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

  it('preserves escaped backticks, escaped HTML brackets, and escaped backslashes before code spans', () => {
    expect(formatFuseExcerpt('Use \\`literal\\` punctuation.')).toBe('Use `literal` punctuation.')
    expect(formatFuseExcerpt('Use \\<span> for inline elements.')).toBe('Use <span> for inline elements.')
    expect(formatFuseExcerpt('Use \\\\`code` and `raw\\` together.')).toBe('Use \\code and raw\\ together.')
  })

  it('decodes character references in prose while preserving literal entities in code spans', () => {
    expect(formatFuseExcerpt('A &amp; B, 2 &lt; 3, The &copy; symbol, and &#x27;ok&#39;.')).toBe(
      'A & B, 2 < 3, The © symbol, and \'ok\'.',
    )
    expect(formatFuseExcerpt('Use `&amp;` literally and &lt;tag&gt; in prose.')).toBe(
      'Use &amp; literally and <tag> in prose.',
    )
  })
})
