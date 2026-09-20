import { expect, test } from '@playwright/test'

test('enables API filters only after hydration while keeping reference links available', async ({ page }) => {
  let release!: () => void
  const ready = new Promise<void>(resolve => release = resolve)
  await page.route('**/*.js', async (route) => {
    await ready
    await route.continue()
  })
  try {
    await page.goto('/api/', { waitUntil: 'commit' })
    await expect(page.locator('.api-filter-input')).toBeDisabled()
    await expect(page.locator('.api-module-filter button').first()).toBeDisabled()
    await expect(page.locator('.api-link').first()).toHaveAttribute('href', /^\/api\//)
    release()
    await expect(page.locator('.api-filter-input')).toBeEnabled()
    await page.locator('.api-filter-input').fill('defineSiteConfig')
    await expect(page.locator('.api-item')).toHaveCount(1)
  }
  finally { release() }
})

test('filters the API overview and follows a real generated symbol', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/api/')
  await expect(page).toHaveTitle(/API Reference/)
  await expect(page.locator('h1')).toHaveCount(1)
  await page.locator('.api-module-filter button').filter({ hasText: /^node$/ }).click()
  await expect(page.locator('.api-module-title')).toHaveText('node')
  const filter = page.locator('.api-filter-input')
  await filter.fill('defineSiteConfig')
  await expect(page.locator('.api-item')).toHaveCount(1)
  await page.locator('.api-link').click()
  await expect(page).toHaveURL(/\/api\/node\/functions\/defineSiteConfig$/)
  await expect(page.locator('h1')).toContainText('defineSiteConfig')
  await expect(page.locator('main')).toContainText('Defined in:')
  await expect(page.locator('.press-lastUpdated')).toHaveCount(0)
  await expect(page.locator('a[href*="edit/main/.valaxy"]')).toHaveCount(0)
  const menu = page.locator('.press-local-nav .menu')
  if (await menu.isVisible())
    await menu.click()
  const sidebar = page.locator('#pr-sidebar-nav')
  await expect(sidebar.locator('a[href="/api/node/functions/defineSiteConfig"]')).toBeVisible()
  // A closed module should create its child links only after expansion.
  const client = sidebar.locator('li.level-0').filter({ has: page.locator(':scope > .item a[href="/api/client/"]') })
  await expect(client.locator('ul')).toHaveCount(0)
  await client.locator(':scope > .item button').click()
  await expect(client.locator('ul').first()).toBeVisible()
  expect(errors).toEqual([])
})

test('preserves shared symbol, query and anchor when switching languages and reloading', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (/hydration/i.test(message.text()))
      errors.push(message.text())
  })
  const path = '/api/node/functions/defineSiteConfig?from=overview#parameters'
  await page.goto(path)
  await expect.poll(() => page.locator('#app').evaluate(el => !!(el as HTMLElement & { __vue_app__?: unknown }).__vue_app__)).toBe(true)
  const mobile = page.getByRole('button', { name: /^(Open navigation|打开导航)$/ })
  if (await mobile.isVisible()) {
    await mobile.click()
    await page.locator('.press-locale-trigger:visible').click()
  }
  else {
    await page.locator('.pr-nav-bar-translations button:visible').click()
  }
  await page.locator('.pr-nav-bar-translations a, [role="menuitem"]').filter({ hasText: '简体中文' }).click()
  await expect(page).toHaveURL(new RegExp(`${path.replace('?', '\\?')}$`))
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://valaxy.site/api/node/functions/defineSiteConfig')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('#parameters')).toBeAttached()
  await page.goto('/guide/getting-started')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  expect(errors).toEqual([])
})

test('keeps API declarations readable in dark mode and recovers from an empty filter', async ({ page }) => {
  await page.goto('/api/')
  await page.locator('.api-filter-input').fill('no-such-api-symbol')
  await expect(page.locator('.api-empty')).toBeVisible()
  await page.locator('.api-clear').click()
  await expect(page.locator('.api-module-title')).toHaveCount(3)
  await page.goto('/api/types/interfaces/ValaxyConfig')
  await page.locator('html').evaluate(el => el.classList.add('dark'))
  await expect(page.locator('.press-api-document h1')).toContainText('ValaxyConfig')
  const width = await page.evaluate(() => ({ body: document.documentElement.scrollWidth, viewport: innerWidth }))
  expect(width.body).toBeLessThanOrEqual(width.viewport + 1)
  await expect(page.locator('main pre').first()).toBeVisible()
})
