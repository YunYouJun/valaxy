import { createServer } from 'node:http'
import { expect, test } from '@playwright/test'
import { foucGuardHtml } from '../../packages/valaxy/node/scripts/fouc-guard'
import { setup } from '../utils'
import { waitForHydration } from '../utils/hydration'

setup('theme-yun')

test('keeps the first frame hidden while the streamed head is missing its stylesheet', async ({ page }) => {
  const head = Promise.withResolvers<void>()
  const css = Promise.withResolvers<void>()
  const image = Promise.withResolvers<void>()
  const server = createServer((_, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    response.write(`<!doctype html><html><head>${foucGuardHtml(0)}<meta name="checkpoint" content="before stylesheet">`)
    void head.promise.then(() => response.end('<link rel="stylesheet" href="/main.css"></head><body><img src="/pending.png" alt="">Content</body></html>'))
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string')
    throw new Error('Expected an HTTP server port')
  await page.route('**/main.css', async (route) => {
    await css.promise
    await route.fulfill({ contentType: 'text/css', body: 'body { color: rgb(12, 34, 56) }' })
  })
  await page.route('**/pending.png', async (route) => {
    await image.promise
    await route.abort()
  })
  try {
    await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: 'commit' })
    await expect(page.locator('meta[name="checkpoint"]')).toBeAttached()
    await expect(page.locator('#valaxy-fouc')).toBeAttached()
    head.resolve()

    await expect(page.locator('body')).toHaveCSS('margin-top', '0px')
    await expect(page.locator('body')).toHaveCSS('opacity', '0')
    css.resolve()
    // A pending image keeps the window load event from doing the reveal.
    await expect(page.locator('#valaxy-fouc')).not.toBeAttached()
    await expect(page.locator('body')).toHaveCSS('opacity', '1')
    await expect(page.locator('body')).toHaveCSS('color', 'rgb(12, 34, 56)')
  }
  finally {
    head.resolve()
    css.resolve()
    image.resolve()
    await new Promise<void>(resolve => server.close(() => resolve()))
  }
})

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
