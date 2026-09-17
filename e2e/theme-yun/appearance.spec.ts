import process from 'node:process'
import { expect, test } from '@playwright/test'
import { env } from '../env'

// The override also exercises the packaged theme in a consuming blog.
test.use({ baseURL: process.env.YUN_APPEARANCE_URL || env['theme-yun'], viewport: { width: 1440, height: 1000 } })

test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|loli)\.com/, route => route.abort())
})

for (const colorScheme of ['dark', 'light'] as const) {
  test(`grid follows the pointer and leaves links usable in ${colorScheme} mode`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.emulateMedia({ colorScheme, reducedMotion: 'no-preference' })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const hero = page.locator('.yun-prologue')
    const grid = hero.locator('.yun-prologue-grid')
    await expect(grid).toBeVisible()
    await expect(grid).toHaveAttribute('aria-hidden', 'true')
    await expect(grid).toHaveCSS('pointer-events', 'none')
    await expect(grid).toHaveClass(/is-faded/)
    await hero.hover({ position: { x: 950, y: 350 } })
    await expect(grid).toHaveClass(/is-active/)
    await expect.poll(() => grid.evaluate(el => getComputedStyle(el, '::after').opacity)).toBe('1')
    const firstX = await hero.evaluate(el => el.style.getPropertyValue('--yun-grid-pointer-x'))
    await hero.hover({ position: { x: 650, y: 400 } })
    await expect.poll(() => hero.evaluate(el => el.style.getPropertyValue('--yun-grid-pointer-x'))).not.toBe(firstX)
    await page.mouse.move(10, 10)
    await expect(grid).not.toHaveClass(/is-active/)
    await expect.poll(() => grid.evaluate(el => getComputedStyle(el, '::after').opacity)).toBe('0')

    const link = hero.locator('a[href="/posts/"]').first()
    await link.click()
    await expect(page).toHaveURL(/\/posts\/?$/)
    await expect(hero).toHaveCount(0)
    await page.goBack()
    await expect(grid).toBeVisible()
    await expect(grid).not.toHaveClass(/is-active/)
    expect(errors).toEqual([])
  })
}

test('reduced motion disables pointer tracking and card scaling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'dark' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const hero = page.locator('.yun-prologue')
  const grid = hero.locator('.yun-prologue-grid')
  await hero.hover({ position: { x: 900, y: 300 } })
  await expect(grid).toHaveClass(/is-active/)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(grid).not.toHaveClass(/is-active/)
  await hero.hover({ position: { x: 800, y: 400 } })
  await expect(grid).not.toHaveClass(/is-active/)
  await expect.poll(() => grid.evaluate(el => getComputedStyle(el, '::after').display)).toBe('none')
  const card = page.locator('.post-card-wrapper').first()
  await card.hover()
  await expect(card).toHaveCSS('scale', '1')
  await expect(card).toHaveCSS('transition-duration', '0s')
})

test('touch devices keep a static grid without horizontal overflow', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: process.env.YUN_APPEARANCE_URL || env['theme-yun'],
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    colorScheme: 'dark',
  })
  const page = await context.newPage()
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const grid = page.locator('.yun-prologue-grid')
  await expect(grid).toBeVisible()
  await page.touchscreen.tap(30, 150)
  await expect(grid).not.toHaveClass(/is-active/)
  await expect.poll(() => grid.evaluate(el => getComputedStyle(el, '::after').display)).toBe('none')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await context.close()
})

test('excerpt option, navigation glass and original post interactions work together', async ({ page }) => {
  // A late quote response shifts the cards underneath the pointer.
  await page.route('https://v1.hitokoto.cn/**', route => route.fulfill({
    json: { hitokoto: 'A stable quote for the hover test.', from_who: 'Valaxy', from: 'E2E' },
  }))
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.say-content')).toHaveText('A stable quote for the hover test.')
  const card = page.locator('.post-card-wrapper').first()
  await expect(page.locator('.yun-excerpt-bottom-gradient')).toHaveCount(0)
  await expect(page.locator('.yun-nav-menu')).toHaveClass(/is-glass/)
  await expect(page.locator('.yun-nav-menu')).toHaveCSS('backdrop-filter', 'none')
  await expect.poll(() => page.locator('.yun-nav-menu').evaluate(el => getComputedStyle(el, '::before').backdropFilter)).not.toBe('none')
  const title = card.locator('.post-title-link')
  await title.hover()
  await expect(card).toHaveCSS('scale', '1.02')
  await expect.poll(() => title.evaluate(el => getComputedStyle(el, '::before').opacity)).toBe('1')
  const overlay = card.locator('.post-card-overlay')
  await overlay.focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(overlay).toBeFocused()
  await expect(overlay).toHaveCSS('outline-style', 'solid')
  await expect(overlay).toHaveCSS('outline-offset', '-3px')
  const href = await overlay.getAttribute('href')
  await page.keyboard.press('Enter')
  await expect.poll(() => new URL(page.url()).pathname).toBe(href)
  await expect(page.locator('.post-header')).toBeVisible()
})
