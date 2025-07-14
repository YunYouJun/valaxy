import { expect, test } from '@playwright/test'
import { setup } from '../utils'

setup('theme-yun')

test.describe('TOC', () => {
  test('toc generate', async ({ page }) => {
    await page.goto('/posts/hello-valaxy')

    await expect(page.locator('.yun-aside')).toHaveCount(1)
    await expect(page.locator('.yun-aside .va-toc-item')).toHaveCount(2)

    const vaTocItem = page.locator('.yun-aside .va-toc-item').nth(0)
    await expect(vaTocItem).toHaveAttribute('lang', 'en')
    await expect(vaTocItem).toHaveText('What is Valaxy?')
  })
})
