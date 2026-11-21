import { expect, test } from '@playwright/test'
import { setup } from '../utils'
import { waitForHydration } from '../utils/hydration'

setup('theme-yun')

test.describe('TOC', () => {
  test('toc generate', async ({ page }) => {
    await page.goto('/posts/hello-valaxy')

    await expect(page.locator('.yun-aside')).toHaveCount(1)
    await expect(page.locator('.yun-aside .va-toc-item')).toHaveText([
      'What is Valaxy?',
      '什么是 Valaxy?',
      'A Vue component in your post',
    ])

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

  test('mobile outline drawer aligns close button and keeps focus ring inside header', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/posts/hello-valaxy', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    const trigger = page.locator('.yun-local-outline-trigger')
    await expect(trigger).toBeVisible()
    await trigger.focus()
    await page.keyboard.press('Enter')

    const aside = page.locator('#yun-page-outline')
    const header = aside.locator('.yun-aside-mobile-header')
    const closeBtn = aside.locator('.yun-aside-close')
    await expect(aside).toHaveClass(/\bopen\b/)
    await expect(aside).toBeVisible()
    await expect(header).toBeVisible()
    await expect(closeBtn).toBeFocused()
    await expect(closeBtn).toHaveCSS('border-radius', '10px')
    await expect(closeBtn).toHaveCSS('outline-style', 'solid')
    await expect(closeBtn).toHaveCSS('outline-offset', '1px')

    const icon = closeBtn.locator('span')
    await expect(icon).toHaveCSS('width', '20px')
    await expect(icon).toHaveCSS('height', '20px')

    const headerBox = await header.boundingBox()
    const closeBox = await closeBtn.boundingBox()
    expect(headerBox).not.toBeNull()
    expect(closeBox).not.toBeNull()
    expect(closeBox!.y - 3).toBeGreaterThanOrEqual(headerBox!.y)
    expect(closeBox!.y + closeBox!.height + 3).toBeLessThanOrEqual(headerBox!.y + headerBox!.height)

    await closeBtn.click()
    await expect(aside).not.toHaveClass(/open/)
    await expect(trigger).toBeFocused()
  })
})
