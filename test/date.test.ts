import { describe, expect, it } from 'vitest'
import { dateExamples } from '../e2e/utils/date-examples'
import { dayjs, formatDate } from '../packages/valaxy/client/utils/time'

it('dayjs date', () => {
  dayjs.tz.setDefault('Europe/Berlin')
  expect(dayjs.tz('2024-01-01T00:00Z').format()).toBe('2024-01-01T00:00:00+01:00')
})

describe('dayjs date', () => {
  process.env.TZ = 'Asia/Shanghai'
  dayjs.tz.setDefault('Asia/Shanghai')

  for (let i = 0; i < dateExamples.length; i++) {
    const example = dateExamples[i]
    it(`timezone format validation(${i}): ${example.date} ${example.expected}`, async () => {
      expect(formatDate(example.date, {
        template: example.template,
        timezone: example.timezone,
      })).toBe(example.expected)
    })
  }
})
