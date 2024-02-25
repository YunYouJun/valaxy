import { expect, test } from '@playwright/test'
import { env } from '../env'

test.use({
  baseURL: env['theme-yun'],
})

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('inject head and body by index.html', () => {
  test('head', async ({ page }) => {
    await expect(page.locator('head meta[name="TEST_INJECT_HEAD"]')).toHaveCount(1)
  })

  test('body', async ({ page }) => {
    await expect(page.locator('body #TEST_INJECT_BODY')).toHaveCount(1)
  })
})
