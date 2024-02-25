import { expect, test } from '@playwright/test'
import { env } from '../env'

test.use({
  baseURL: env.docs,
})

test.describe('docs feature', () => {
  test('code height limit', async ({ page }) => {
    await page.goto('/examples/code-height-limit')
    // Expect a collapse button
    await expect(page.getByRole('article').locator('button.collapse').nth(1)).toBeVisible()
  })

  test('partial content encryption', async ({ page }) => {
    await page.goto('/examples/partial-content-encryption')
    // Expect a decrypt password container
    await expect(page.locator('div.decrypt-password-container')).toBeVisible()
  })
})
