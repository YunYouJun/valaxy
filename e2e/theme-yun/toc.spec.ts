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

  test('toc is visible on desktop viewport', async ({ page }) => {
    // Desktop Chrome viewport is 1280x720 (xl breakpoint)
    // At xl (1280px+), .yun-aside uses CSS media query to switch to
    // position: sticky with width: 320px, making the TOC visible.
    await page.goto('/posts/hello-valaxy')
    await page.waitForSelector('.markdown-body')

    const aside = page.locator('.yun-aside')
    await expect(aside).toBeVisible()

    // TOC items populate after hydration via onContentUpdated().
    // CSS i18n hides items whose lang doesn't match the page locale (zh-CN),
    // so target a visible outline link rather than .first().
    const tocLink = page.locator('.yun-aside .va-toc-item .outline-link').locator('visible=true').first()
    await expect(tocLink).toBeVisible()
  })
})
