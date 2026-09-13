import process from 'node:process'
import { expect, test } from '@playwright/test'
import { env } from '../env'

test.use({ baseURL: process.env.YUN_SEARCH_URL || env['theme-yun'] })

for (const mode of ['light', 'dark', 'mobile'] as const) {
  test(`Fuse search keeps focus contained and fades only overflowing results (${mode})`, async ({ page }) => {
    await page.setViewportSize(mode === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 900 })
    await page.emulateMedia({ colorScheme: mode === 'light' ? 'light' : 'dark' })
    await page.route(/fonts\.(googleapis|loli)\.com/, route => route.abort())
    await page.route('**/valaxy-fuse-list.json', route => route.fulfill({
      json: Array.from({ length: 24 }, (_, i) => ({
        title: `Yun article ${i} ${i === 0 ? 'OnlyOne' : ''}`,
        link: `/posts/search-fixture-${i}`,
        excerpt: 'A concise excerpt for testing search result readability and scrolling.',
      })),
    }))
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    // Home navigation remounts after its entrance animation.
    await page.waitForTimeout(2500)
    const trigger = page.locator('.yun-search-btn')
    await trigger.click()
    const dialog = page.getByRole('dialog')
    await expect(page.locator('#valaxy-teleports').getByRole('dialog')).toBeVisible()
    await expect(dialog).toHaveAccessibleName(/搜索文章|Search articles/)
    await expect(dialog).toHaveAccessibleDescription(/方向键|arrow keys/)
    const input = dialog.getByRole('searchbox')
    await expect(input).toBeFocused()
    await input.fill('Yun')
    const results = dialog.locator('.yun-search-results')
    await expect(dialog.locator('.yun-search-result')).toHaveCount(24)
    await expect.poll(() => results.evaluate(el => el.style.getPropertyValue('--yun-search-fade-bottom'))).toBe('56px')
    await expect(results).not.toHaveCSS('mask-image', 'none')
    await results.evaluate(el => el.scrollTo(0, el.scrollHeight))
    await expect.poll(() => results.evaluate(el => el.style.getPropertyValue('--yun-search-fade-bottom'))).toBe('0px')
    await expect(dialog.locator('.yun-search-result').last()).toBeInViewport()
    await input.fill('OnlyOne')
    await expect(dialog.locator('.yun-search-result')).toHaveCount(1)
    await expect.poll(() => results.evaluate(el => el.style.getPropertyValue('--yun-search-fade-bottom'))).toBe('0px')
    await page.keyboard.press('ArrowDown')
    await expect(dialog.locator('.is-selected')).toBeFocused()
    await input.focus()
    await page.keyboard.press('Shift+Tab')
    expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true)
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toBeFocused()
    expect(errors).toEqual([])
  })
}
