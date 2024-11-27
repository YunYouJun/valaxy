import { expect, test } from '@playwright/test'
import { env } from '../../env'

test.use({
  baseURL: env['theme-yun'],
})

test.describe('markdown footnote tooltip', () => {
  test('visibility', async ({ page }) => {
    await page.goto('/posts/hello-valaxy')
    await page.evaluate(() => {
      document.documentElement.setAttribute('lang', 'zh-CN')
    })
    // await menu move animation
    await page.waitForTimeout(500)
    await page.locator('a[href="#fn1"]').hover()
    await expect(page.locator('.v-popper__popper')).toContainText('Here is the footnote.')
  })
})
