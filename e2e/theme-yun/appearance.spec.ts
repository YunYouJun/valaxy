import process from 'node:process'
import { expect, test } from '@playwright/test'
import { env } from '../env'
import { waitForHydration } from '../utils/hydration'

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
    await waitForHydration(page)
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
    await expect(page.locator('.yun-nav-menu a[href="/posts/"]')).toHaveAttribute('aria-current', 'page')
    await page.goBack()
    await expect(grid).toBeVisible()
    await expect(grid).not.toHaveClass(/is-active/)
    expect(errors).toEqual([])
  })
}

test('reduced motion disables pointer tracking and card scaling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'dark' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForHydration(page)
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
  await expect(card).toHaveCSS('transform', 'none')
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
  await waitForHydration(page)
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
  await waitForHydration(page)
  await expect(page.locator('.say-content')).toHaveText('A stable quote for the hover test.')
  const card = page.locator('.post-card-wrapper').first()
  const excerptGradient = card.locator('.yun-excerpt-bottom-gradient')
  await expect(excerptGradient).toHaveCount(1)
  await expect(excerptGradient).toHaveCSS('pointer-events', 'none')
  await expect(page.locator('.yun-nav-menu')).toHaveClass(/is-glass/)
  await expect(page.locator('.yun-nav-menu')).toHaveCSS('backdrop-filter', 'none')
  await expect.poll(() => page.locator('.yun-nav-menu').evaluate(el => getComputedStyle(el, '::before').backdropFilter)).not.toBe('none')
  const title = card.locator('.post-title-link')
  await title.hover()
  await expect(card).toHaveCSS('scale', 'none')
  await expect(card).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -2)')
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

test('post status bookmark flags, tooltips, draft border and empty actions work cleanly', async ({ page }) => {
  await page.route('https://v1.hitokoto.cn/**', route => route.fulfill({
    json: { hitokoto: 'A stable quote for the status test.', from_who: 'Valaxy', from: 'E2E' },
  }))

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForHydration(page)

  const firstCard = page.locator('.post-card-wrapper').first()
  const topBookmark = firstCard.locator('.post-status-bookmark.is-top')
  await expect(topBookmark).toBeVisible()

  const titleBox = await firstCard.locator('.post-title-link').boundingBox()
  const topBookmarkBox = await topBookmark.boundingBox()
  expect(titleBox).not.toBeNull()
  expect(topBookmarkBox).not.toBeNull()
  expect(topBookmarkBox!.x).toBeGreaterThanOrEqual(titleBox!.x + titleBox!.width)

  await topBookmark.hover()
  await expect(page.locator('.yun-tooltip')).toHaveText(/置顶|Pinned/)
  await page.mouse.move(10, 10)

  const emptyActionsCard = page.locator('.post-card-wrapper').filter({ hasText: '代码块图标测试' }).first()
  await expect(emptyActionsCard).toBeVisible()
  await expect(emptyActionsCard.locator('.yun-card-actions')).toHaveCount(0)

  if (!process.env.YUN_APPEARANCE_URL) {
    await page.goto(env['theme-yun-dev'], { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    const draftCard = page.locator('.post-card-wrapper').filter({ hasText: '草稿测试' }).first()
    await expect(draftCard).toHaveClass(/is-draft/)
    await expect(draftCard).toHaveCSS('border-top-style', 'dashed')

    const draftTopBookmark = draftCard.locator('.post-status-bookmark.is-top')
    const draftBookmark = draftCard.locator('.post-status-bookmark.is-draft')
    await expect(draftTopBookmark).toBeVisible()
    await expect(draftBookmark).toBeVisible()

    const draftTitleBox = await draftCard.locator('.post-title-link').boundingBox()
    const draftTopBox = await draftTopBookmark.boundingBox()
    expect(draftTitleBox).not.toBeNull()
    expect(draftTopBox).not.toBeNull()
    expect(draftTopBox!.x).toBeGreaterThanOrEqual(draftTitleBox!.x + draftTitleBox!.width)

    await draftBookmark.hover()
    await expect(page.locator('.yun-tooltip')).toHaveText(/草稿|Draft/)

    await page.goto(`${env['theme-yun-dev']}/posts/draft`, { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    const articleCard = page.locator('.yun-main .yun-card').first()
    await expect(articleCard).toHaveClass(/is-draft/)
    await expect(articleCard).toHaveCSS('border-top-style', 'dashed')

    const articleDraftBookmark = articleCard.locator('.post-status-bookmark.is-draft')
    await expect(articleDraftBookmark).toBeVisible()
    const cardBox = await articleCard.boundingBox()
    const articleBookmarkBox = await articleDraftBookmark.boundingBox()
    expect(cardBox).not.toBeNull()
    expect(articleBookmarkBox).not.toBeNull()
    expect(articleBookmarkBox!.x + articleBookmarkBox!.width).toBeLessThan(cardBox!.x + cardBox!.width / 2)
  }
})
