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

  test('collapsible sections, toggle-all control, and active marker fallback', async ({ page }) => {
    await page.goto('/posts/long-toc')
    await page.waitForSelector('.markdown-body')

    const aside = page.locator('.yun-aside')
    const toggleAllBtn = aside.locator('.outline-toggle-all')
    await expect(toggleAllBtn).toBeVisible()

    // Toggle an individual collapsible section (TOC 1)
    const toc1Toggle = aside.locator('button[aria-label*="TOC 1"]').first()
    await expect(toc1Toggle).toHaveAttribute('aria-expanded', 'true')
    const toc1BranchId = await toc1Toggle.getAttribute('aria-controls')
    expect(toc1BranchId).toBeTruthy()
    const toc1Branch = aside.locator(`#${toc1BranchId}`)

    await toc1Toggle.click()
    await expect(toc1Toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toc1Branch).toHaveAttribute('data-outline-collapsed', 'true')

    await toc1Toggle.click()
    await expect(toc1Toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(toc1Branch).not.toHaveAttribute('data-outline-collapsed', 'true')

    // Collapse all and expand all via header toggle button
    await toggleAllBtn.click()
    await expect(toggleAllBtn).toHaveAttribute('aria-pressed', 'true')
    const collapsedCount = await aside.locator('[data-outline-collapsed="true"]').count()
    expect(collapsedCount).toBeGreaterThan(10)

    await toggleAllBtn.click()
    await expect(toggleAllBtn).toHaveAttribute('aria-pressed', 'false')
    await expect(aside.locator('[data-outline-collapsed="true"]')).toHaveCount(0)

    // Collapse TOC 15, scroll to page bottom (#sub-toc-15 inside collapsed branch),
    // and ensure parent gets .has-active-child while .outline-marker tracks visible TOC 15 link.
    const toc15Toggle = aside.locator('button[aria-label*="TOC 15"]').first()
    await toc15Toggle.click()
    await expect(toc15Toggle).toHaveAttribute('aria-expanded', 'false')

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })

    const toc15Item = aside.locator('.va-toc > .va-toc-item', { has: page.locator('button[aria-label*="TOC 15"]') })
    await expect(toc15Item).toHaveClass(/has-active-child/)

    const marker = aside.locator('.outline-marker')
    await expect(marker).toHaveCSS('opacity', '1')

    await expect.poll(async () => {
      return aside.evaluate((el) => {
        const markerEl = el.querySelector('.outline-marker') as HTMLElement | null
        const rowLink = el.querySelector('.va-toc-item.has-active-child > .outline-link') as HTMLElement | null
        if (!markerEl || !rowLink)
          return Number.POSITIVE_INFINITY
        return Math.abs(Number.parseFloat(markerEl.style.top) - (rowLink.offsetTop + 33))
      })
    }).toBeLessThanOrEqual(2)
  })
})
