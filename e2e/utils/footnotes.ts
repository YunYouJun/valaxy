import { expect, test } from '@playwright/test'
import { waitForHydration } from './hydration'

export function testFootnotePreviews(path: string) {
  test.beforeEach(async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)
  })

  test('hydrates without warnings and keeps usable static footnote links', async ({ page, browser }) => {
    const warnings: string[] = []
    page.on('console', (message) => {
      if (['warning', 'error'].includes(message.type()) && /hydration/i.test(message.text()))
        warnings.push(message.text())
    })
    page.on('pageerror', error => warnings.push(error.message))
    await page.reload({ waitUntil: 'domcontentloaded' })
    await waitForHydration(page)
    // The root can mount before an async route; exercise the hydrated article too.
    await page.locator('.va-footnote-preview').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    const ids = await page.locator('.va-footnote [id]').evaluateAll(elements => elements.map(el => el.id))
    expect(new Set(ids).size).toBe(ids.length)
    expect(warnings).toEqual([])

    const context = await browser.newContext({ javaScriptEnabled: false })
    try {
      const staticPage = await context.newPage()
      await staticPage.goto(page.url(), { waitUntil: 'domcontentloaded' })
      await staticPage.locator('a[href="#fn2"]').click()
      await expect(staticPage).toHaveURL(/#fn2$/)
      await expect(staticPage.locator('#fn2')).toContainText('formatted text')
    }
    finally {
      await context.close()
    }
  })

  test('opens a rich hover preview without stealing focus', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Hover requires a mouse')
    const anchor = page.locator('a[href="#fn2"]')
    await anchor.focus()
    await anchor.hover()
    const preview = page.locator('.va-footnote-popover')
    await expect(preview).toBeVisible()
    await expect(anchor).toBeFocused()
    await expect(preview.locator('strong')).toHaveText('formatted text')
    await preview.hover()
    await expect(preview).toBeVisible()
    await preview.getByRole('link', { name: 'preview target' }).click()
    await expect(page).toHaveURL(/#preview-target$/)
  })

  test('retains the global Floating Vue directive during migration', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Legacy tooltip uses hover')
    await page.getByRole('button', { name: 'Legacy tooltip', exact: true }).hover()
    await expect(page.locator('.v-popper__popper')).toContainText('Legacy global tooltip')
  })

  test('supports keyboard focus, Escape, and the original anchor jump', async ({ page }) => {
    const trigger = page.locator('.va-footnote-preview').nth(1)
    await trigger.focus()
    await page.keyboard.press('Enter')
    const preview = page.getByRole('dialog')
    await expect(preview).toBeVisible()
    await expect(preview.locator('.va-footnote-close')).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(preview.getByRole('link', { name: 'preview target' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(preview).toBeHidden()
    await expect(trigger).toBeFocused()
    await page.locator('a[href="#fn2"]').click()
    await expect(page).toHaveURL(/#fn2$/)
  })

  test('dismisses on outside interaction and can open another footnote', async ({ page }) => {
    await page.locator('.va-footnote-preview').nth(1).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.locator('#preview-target').click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await page.locator('.va-footnote-preview').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('dialog')).not.toContainText('formatted text')
  })

  test('opens and dismisses on touch within the viewport', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Requires touch emulation')
    await page.locator('.va-footnote-preview').nth(1).tap()
    const preview = page.getByRole('dialog')
    await expect(preview).toBeVisible()
    const box = await preview.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
    await preview.getByRole('link', { name: 'preview target' }).tap()
    await expect(page).toHaveURL(/#preview-target$/)
    await page.keyboard.press('Escape')
    await page.locator('.va-footnote-preview').nth(1).tap()
    await expect(preview).toBeVisible()
    await preview.locator('.va-footnote-close').tap()
    await expect(preview).toBeHidden()
  })
}
