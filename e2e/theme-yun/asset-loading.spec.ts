import { expect, test } from '@playwright/test'
import { setup } from '../utils'
import { waitForHydration } from '../utils/hydration'

setup('theme-yun')

test('shows the home page before the optional serif font stylesheet loads', async ({ page }) => {
  let releaseFont!: () => void
  const fontGate = new Promise<void>((resolve) => {
    releaseFont = resolve
  })
  const fontUrl = 'https://fonts.googleapis.com/css2?**'
  await page.route('https://**/*', route => route.abort())
  await page.route(fontUrl, async (route) => {
    await fontGate
    await route.fulfill({ contentType: 'text/css', body: ':root { --test-serif-font-loaded: yes }' })
  })
  try {
    const fontRequested = page.waitForRequest(fontUrl)
    await page.goto('/', { waitUntil: 'commit' })
    await fontRequested
    await expect.poll(
      () => page.evaluate(() => performance.getEntriesByName('first-contentful-paint').length),
      { timeout: 2000 },
    ).toBeGreaterThan(0)

    releaseFont()
    await expect(page.locator('html')).toHaveCSS('--test-serif-font-loaded', 'yes')
  }
  finally { releaseFont() }
})

test('loads KaTeX fonts only when navigating to math', async ({ page }) => {
  const fonts: string[] = []
  const errors: string[] = []
  page.on('request', (request) => {
    if (/KaTeX_.*\.woff2?$/.test(request.url()))
      fonts.push(request.url())
  })
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await waitForHydration(page)
  await expect(page.locator('.katex')).toHaveCount(0)
  expect(fonts).toEqual([])
  await expect(page.locator('link[rel="preload"][href*="KaTeX_"]')).toHaveCount(0)

  // Search uses router navigation: the already loaded global CSS must also
  // style math when the initial page has never requested a KaTeX font.
  await page.locator('.yun-search-btn').click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('searchbox').fill('KaTeX')
  await dialog.locator('a[href="/posts/katex"]').first().click()
  await expect(page).toHaveURL(/\/posts\/katex$/)
  await expect(page.locator('.katex').first()).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  expect(fonts.length).toBeGreaterThan(0)
  expect(fonts.every(url => url.endsWith('.woff2'))).toBe(true)
  expect(await page.evaluate(() => document.fonts.check('16px KaTeX_Main'))).toBe(true)
  await expect(page.locator('link[rel="preload"][href*="KaTeX_"]')).toHaveCount(0)
  expect(errors).toEqual([])
})
