// import { resolve } from 'path'
import { describe, expect, it } from 'vitest'
import { format } from 'date-fns'

// const cnTimezone = 'Asia/Shanghai'
// const mdDir = resolve(__dirname, 'fixtures/markdown')

describe('frontmatter parse', async () => {
  it('page:time', () => {
    const date = new Date('2023-07-19 18:55:53')
    const formattedDate = format(date, 'yyyy-MM-dd')

    expect(formattedDate).toBe('2023-07-19')
  })
})
