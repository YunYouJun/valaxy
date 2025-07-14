import { expect, test } from '@playwright/test'
import { setup } from '../utils'

setup('theme-yun')

test.describe('outline', () => {
  test('long toc scroll', async ({ page }) => {
    await page.goto('/posts/long-toc')

    await page.waitForSelector('.markdown-body')
    await expect(page.locator('.yun-aside')).toBeInViewport()

    // scroll
    await page.evaluate(() => {
      window.scrollTo(0, 10000)
    })
    await expect(page.locator('.va-toc .va-toc-item').first()).not.toBeInViewport()
    await expect(page.locator('.va-toc .va-toc-item').last()).toBeInViewport()
  })
})
