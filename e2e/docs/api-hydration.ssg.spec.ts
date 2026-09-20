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
