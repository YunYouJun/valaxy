import { expect, test } from '@playwright/test'
import { env } from '../env'
import { waitForHydration } from '../utils/hydration'

test.use({ baseURL: env['theme-yun'], viewport: { width: 1440, height: 1000 } })

test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|loli)\.com/, route => route.fulfill({ contentType: 'text/css', body: '' }))
  await page.route('https://v1.hitokoto.cn/**', route => route.fulfill({
    json: { hitokoto: 'A stable quote for the hover test.', from_who: 'Valaxy', from: 'E2E' },
  }))
})

for (const colorScheme of ['light', 'dark'] as const) {
  test(`glass navigation keeps colored icons and neutral labels in ${colorScheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)
    const navigation = page.locator('.prologue-navigation')
    const posts = navigation.locator('a[href="/posts/"]')
    const moments = navigation.locator('a[href="/moments/"]')
    await expect(navigation).toHaveAttribute('data-style', 'glass')
    await expect(posts).toHaveCSS('border-radius', '999px')
    await expect(posts).toHaveCSS('backdrop-filter', /blur\(14px\)/)
    await expect(moments.locator('.icon')).toHaveCSS('color', 'rgb(0, 155, 129)')
    const labelColors = await navigation.locator('.yun-site-link-label').evaluateAll(
      links => links.map(link => getComputedStyle(link).color),
    )
    expect(new Set(labelColors).size).toBe(1)

    const social = page.locator('.prologue-social .links-of-author-item').filter({ has: page.locator('.i-ri-bilibili-line') })
    const icon = social.locator('.icon')
    await expect(icon).not.toHaveCSS('color', 'rgb(255, 142, 179)')
    await social.hover()
    await expect(icon).toHaveCSS('color', 'rgb(255, 142, 179)')

    await page.emulateMedia({ contrast: 'more' })
    await posts.hover()
    await expect(posts).toHaveCSS('backdrop-filter', 'none')
    await expect(posts).toHaveCSS('box-shadow', 'none')
  })
}

test('glass scroll controls and pagination retain their interactions', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForHydration(page)
  const goDown = page.getByRole('button', { name: 'go-down' })
  const backToTop = page.locator('.back-to-top')
  await expect(goDown).toHaveCSS('border-radius', '50%')
  await goDown.click()
  await expect(backToTop).toBeVisible()
  await backToTop.click()
  await expect(backToTop).toBeHidden()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

  const tag = page.locator('.yun-card-actions .post-tag').first()
  await tag.hover()
  const activeColor = await page.locator('.yun-nav-menu a[aria-current="page"]').evaluate(el => getComputedStyle(el).color)
  await expect(tag).toHaveCSS('color', activeColor)

  const pagination = page.locator('nav.pagination')
  await expect(pagination).toHaveCSS('backdrop-filter', /blur\(14px\)/)
  await expect(pagination.locator('a[aria-current="page"]')).toHaveText('1')
  await pagination.getByRole('link', { name: 'next' }).click()
  await expect(page).toHaveURL(/\/page\/2\/?$/)
  await expect(pagination.locator('a[aria-current="page"]')).toHaveText('2')
})

test('back-to-top progress stays stable across adjacent scroll positions', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForHydration(page)

  const angles = await page.locator('.back-to-top').evaluate(async (button) => {
    const scrollRange = document.documentElement.scrollHeight - window.innerHeight
    const middle = Math.round(scrollRange / 2)

    async function readProgressAt(top: number) {
      window.scrollTo({ top, behavior: 'instant' })
      // Let the scroll event and Vue's style update finish.
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      return Number.parseFloat(getComputedStyle(button).getPropertyValue('--yun-back-top-progress'))
    }

    return {
      middle: await readProgressAt(middle),
      adjacent: await readProgressAt(middle + 1),
      later: await readProgressAt(Math.round(scrollRange * 0.75)),
      end: await readProgressAt(scrollRange),
    }
  })

  expect(angles.middle).toBeGreaterThan(0)
  expect(angles.adjacent).toBe(angles.middle)
  expect(angles.later).toBeGreaterThan(angles.adjacent)
  expect(angles.end).toBe(360)
})

test.describe('touch navigation', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

  test('glass links fit the mobile grid with touch-sized controls', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)
    const navigation = page.locator('.prologue-navigation')
    const firstLink = navigation.locator('.yun-site-link-item').first()
    await expect(navigation).toHaveCSS('display', 'grid')
    await expect(firstLink).toHaveCSS('min-height', '48px')
    await expect(firstLink).toHaveCSS('border-radius', '999px')
    const social = page.locator('.prologue-social .links-of-author-item').first()
    await expect(social).toHaveCSS('width', '44px')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await firstLink.tap()
    await expect(page).toHaveURL(/\/posts\/?$/)
  })
})
