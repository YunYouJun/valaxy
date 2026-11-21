import { expect, test } from '@playwright/test'
import { setup, waitForHydration } from '../utils'

setup('theme-yun')

test.describe('Projects page and sidebar links', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`renders unified project cards and filter toggles in ${colorScheme} mode`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.emulateMedia({ colorScheme })
      await page.goto('/projects', { waitUntil: 'domcontentloaded' })
      await waitForHydration(page)

      const filters = page.locator('.yun-project-filters')
      const allBtn = filters.getByRole('button', { name: /全部|All/ })
      const interestingBtn = filters.getByRole('button', { name: /整活/ })
      await expect(allBtn).toHaveAttribute('aria-pressed', 'true')
      await expect(interestingBtn).toHaveAttribute('aria-pressed', 'false')

      const collections = page.locator('.yun-project-collection')
      const totalCollections = await collections.count()
      expect(totalCollections).toBeGreaterThan(1)

      const cards = page.locator('.yun-project-card')
      const firstCard = cards.first()
      await expect(firstCard).toBeVisible()
      await expect(firstCard).toHaveCSS('border-radius', '12px')

      const linkButtons = firstCard.locator('.yun-project-link-item')
      const firstLinkBtn = linkButtons.first()
      await expect(firstLinkBtn).toBeVisible()
      await expect(firstLinkBtn).toHaveAttribute('aria-label', /访问站点|Website|GitHub/)
      await expect(firstLinkBtn).toHaveCSS('border-radius', '8px')

      const contrastCheck = await firstLinkBtn.evaluate((el) => {
        const card = el.closest('.yun-project-card')!
        return {
          buttonColor: getComputedStyle(el).color,
          cardBg: getComputedStyle(card).backgroundColor,
        }
      })
      expect(contrastCheck.buttonColor).not.toBe('rgba(0, 0, 0, 0)')
      expect(contrastCheck.buttonColor).not.toBe(contrastCheck.cardBg)

      await interestingBtn.click()
      await expect(interestingBtn).toHaveAttribute('aria-pressed', 'true')
      await expect(allBtn).toHaveAttribute('aria-pressed', 'false')
      await expect(collections).toHaveCount(1)

      await page.setViewportSize({ width: 390, height: 844 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    })
  }

  test('desktop sidebar links respect iconColor, active route, and soft-tint social icons', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/tags/', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    const sidebar = page.locator('.yun-layout-left')
    const momentsLink = sidebar.locator('.yun-sidebar-links a[href="/moments/"]')
    await expect(momentsLink).toBeVisible()
    await expect(momentsLink).toHaveCSS('border-radius', '10px')
    expect(await momentsLink.getAttribute('style')).not.toContain('undefined')

    await expect(momentsLink).not.toHaveCSS('color', 'rgb(0, 120, 231)')
    await expect(momentsLink.locator('.icon')).toHaveCSS('width', '20px')
    await expect(momentsLink.locator('.icon')).toHaveCSS('height', '20px')

    const socialBilibili = sidebar.locator('.links-of-author-item').filter({ has: page.locator('.i-ri-bilibili-line') })
    const socialBox = await socialBilibili.boundingBox()
    expect(socialBox).not.toBeNull()
    expect(socialBox!.width).toBeLessThan(42)
    await expect(socialBilibili.locator('.icon')).not.toHaveCSS('color', 'rgb(255, 142, 179)')

    await page.goto('/moments/', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)
    const activeMomentsLink = sidebar.locator('.yun-sidebar-links a[href="/moments/"]')
    await expect(activeMomentsLink).toHaveAttribute('aria-current', 'page')
    await expect(activeMomentsLink).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  })
})
