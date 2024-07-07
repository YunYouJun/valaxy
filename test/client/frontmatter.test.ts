// import { resolve } from 'path'
import { describe, expect, it } from 'vitest'
import { formatInTimeZone, toDate } from 'date-fns-tz'

const cnTimezone = 'Asia/Shanghai'
const opts = { timeZone: cnTimezone }
// const mdDir = resolve(__dirname, 'fixtures/markdown')

describe('frontmatter parse', async () => {
  it('page:time', () => {
    const date = toDate('2023-07-19 18:55:53', opts)
    const utcDate = toDate('2023-07-19 10:55:53Z', opts)
    const timestampDate = toDate(+date, opts)

    const formattedDate = formatInTimeZone(date, cnTimezone, 'yyyy-MM-dd HH:mm:ss')
    expect(formattedDate).toEqual('2023-07-19 18:55:53')

    expect(date).toEqual(utcDate)
    expect(date).toEqual(timestampDate)
  })

  it('page:date', () => {
    const date = toDate('2023-07-19', opts)
    const utcDate = toDate('2023-07-19T00:00:00+08:00', opts)
    const timestampDate = toDate(+date, opts)

    const formattedDate = formatInTimeZone(date, cnTimezone, 'yyyy-MM-dd HH:mm:ss')
    expect(formattedDate).toEqual('2023-07-19 00:00:00')

    expect(date).toEqual(utcDate)
    expect(date).toEqual(timestampDate)
  })
})
