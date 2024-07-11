// import { resolve } from 'path'
import { describe, expect, it } from 'vitest'

const cnTimezone = 'Asia/Shanghai'
const utcTimezone = 'UTC'

describe('frontmatter parse', async () => {
  it('page:time', () => {
    const date = new Date('2023-07-19 02:12:22+08:00')

    expect(date.toLocaleDateString('zh-CN', { timeZone: cnTimezone })).toBe('2023/7/19')
    expect(date.toLocaleDateString('zh-CN', { timeZone: utcTimezone })).toBe('2023/7/18')
  })
})
