import { expect, test } from '@playwright/test'
import { env } from '../env'

test.use({
  baseURL: env.docs,
})

test.describe('docs feature', () => {
  test('code height limit', async ({ page }) => {
    await page.goto('/examples/code-height-limit')
    // Wait for the page to be fully loaded and JavaScript to run
    // The 'folded' class is added via onMounted in collapse-code.ts
    await page.waitForSelector('.folded', { state: 'attached' })
    // Expect at least one visible collapse button (for code blocks that exceed height limit)
    // The button is only visible when its parent has the 'folded' class
    await expect(page.locator('.folded > button.code-block-unfold-btn').first()).toBeVisible()
  })

  test('partial content encryption', async ({ page }) => {
    await page.goto('/examples/partial-content-encryption')
    // Wait for Vue component to render
    await page.waitForSelector('div.decrypt-password-container', { state: 'visible' })
    // Expect a decrypt password container
    await expect(page.locator('div.decrypt-password-container')).toBeVisible()
  })
})
