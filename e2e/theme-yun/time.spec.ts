import { expect, test } from '@playwright/test'
import { setup } from '../utils'
import { dateExamples } from '../utils/date-examples'

setup('theme-yun')

test.describe('Frontmatter', () => {
  test.beforeEach(async ({ page }) => {
    process.env.TZ = 'Asia/Shanghai'
    await page.goto('/posts/date', { waitUntil: 'domcontentloaded' })
  })

  for (let i = 0; i < dateExamples.length; i++) {
    const example = dateExamples[i]
    test(`timezone format validation(${i}) ${example.date}`, async ({ page }) => {
      await expect(page.locator(`.test-format-date.item-${i} time`)).toHaveText(example.expected)
    })
  }
})
