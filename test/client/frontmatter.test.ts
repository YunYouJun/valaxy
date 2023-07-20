// import { resolve } from 'path'
import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

const cnTimezone = 'Asia/Shanghai'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault(cnTimezone)

// const mdDir = resolve(__dirname, 'fixtures/markdown')

describe('frontmatter parse', async () => {
  it('page:time', () => {
    const date = new Date('2023-07-19 18:55:53')
    const formattedDate = dayjs(date).format('YYYY-MM-DD')

    expect(formattedDate).toBe('2023-07-19')
  })
})
