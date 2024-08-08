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
    await page.getByRole('link').getByText('[1]').hover()
    await expect(page.locator('.v-popper__popper')).toContainText('Here is the footnote.')
  })
})
