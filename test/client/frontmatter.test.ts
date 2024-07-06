// import { resolve } from 'path'
import { describe, expect, it } from 'vitest'
import { formatISO } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'

const cnTimezone = 'Asia/Shanghai'
// const mdDir = resolve(__dirname, 'fixtures/markdown')

describe('frontmatter parse', async () => {
  it('page:time', () => {
    const date = fromZonedTime('2023-07-19 18:55:53', cnTimezone)
    const utcDate = fromZonedTime('2023-07-19 10:55:53Z', cnTimezone)
    const timestampDate = fromZonedTime(+date, cnTimezone)

    const formattedDate = formatISO(date)
    expect(formattedDate).toEqual('2023-07-19T18:55:53+08:00')

    expect(date).toEqual(utcDate)
    expect(date).toEqual(timestampDate)
  })

  it('page:date', () => {
    const date = fromZonedTime('2023-07-19', cnTimezone)
    const utcDate = fromZonedTime('2023-07-19T00:00:00+08:00', cnTimezone)
    const timestampDate = fromZonedTime(+date, cnTimezone)

    const formattedDate = formatISO(date)
    expect(formattedDate).toEqual('2023-07-19T00:00:00+08:00')

    expect(date).toEqual(utcDate)
    expect(date).toEqual(timestampDate)
  })
})
