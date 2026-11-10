import { describe, expect, it } from 'vitest'
import { plainSeoDescription } from '../packages/valaxy/shared/seo'

describe('literal punctuation in SEO summaries', () => {
  it.each([
    ['Use snake_case_name and file_name.md.', 'Use snake_case_name and file_name.md.'],
    ['Keep _drafts and _private folders.', 'Keep _drafts and _private folders.'],
    ['Calculate 2 * 3 * 4 = 24.', 'Calculate 2 * 3 * 4 = 24.'],
    ['Use `snake_case_name` and `*literal*`.', 'Use snake_case_name and *literal*.'],
    ['Use ``a`b_c_d`` here.', 'Use a`b_c_d here.'],
    ['Use \\*literal\\* and \\_literal\\_.', 'Use *literal* and _literal_.'],
    ['[snake_case_name](/guide) and https://example.com/a_b_c', 'snake_case_name and https://example.com/a_b_c'],
    ['**Strong** and *emphasis* and __strong__ and _emphasis_.', 'Strong and emphasis and strong and emphasis.'],
    ['***Both*** and ___both___ and ~~removed~~.', 'Both and both and removed.'],
    ['Unicode 标识_字段_名称 remains.', 'Unicode 标识_字段_名称 remains.'],
  ])('preserves the intended text of %s', (markdown, expected) => {
    expect(plainSeoDescription(markdown)).toBe(expected)
  })
})
