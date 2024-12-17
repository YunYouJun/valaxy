import { expect, test } from '@playwright/test'
import { env } from '../env'
import { dateExamples } from '../utils/date-examples'

test.use({
  baseURL: env['theme-yun'],
})

test.beforeEach(async ({ page }) => {
  process.env.TZ = 'Asia/Shanghai'

  await page.goto('/posts/date')
})

test.describe('Frontmatter', () => {
  for (let i = 0; i < dateExamples.length; i++) {
    const example = dateExamples[i]
    test(`timezone format validation(${i}) ${example.date}`, async ({ page }) => {
      await expect(page.locator(`.test-format-date.item-${i} time`)).toHaveText(example.expected)
    })
  }
})
