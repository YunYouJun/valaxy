import { expect, test } from '@playwright/test'
import { setup } from '../../utils'

setup('theme-yun')

test.describe('Markdown: Custom Container', () => {
  test('Custom Title', async ({ page }) => {
    await page.goto('/test/custom-blocks')
    await page.waitForSelector('.custom-block-title')

    const customDangerTitle = await page.locator('.custom-block-title').nth(5).textContent()
    expect(customDangerTitle).toContain('自定义标题')

    // 第二个 details summary 为自定义标题
    const customDetailsSummary = await page.locator('details summary').nth(1).textContent()
    expect(customDetailsSummary).toContain('自定义标题')
  })
})
