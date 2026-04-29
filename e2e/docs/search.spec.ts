import { expect, test } from '@playwright/test'
import { env } from '../env'

test.use({
  baseURL: env.docs,
})

test.describe('docs search', () => {
  test('search button is visible and opens DocSearch modal', async ({ page }) => {
    // Collect console warnings to verify no "not installed" error
    const warnings: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'warning')
        warnings.push(msg.text())
    })

    await page.goto('/', { waitUntil: 'networkidle' })

    // Search button should be visible
    const searchBtn = page.locator('.PressSearchButton')
    await searchBtn.waitFor({ state: 'visible' })

    // Click search button
    await searchBtn.click()

    // DocSearch modal should appear (Algolia DocSearch creates .DocSearch-Modal)
    // Wait up to 5 seconds for the modal to appear
    const modal = page.locator('.DocSearch-Modal')
    await expect(modal).toBeVisible({ timeout: 5000 })

    // The "not installed" warning should NOT appear
    const algoliaNotInstalled = warnings.some(w =>
      w.includes('valaxy-addon-algolia is not installed'),
    )
    expect(algoliaNotInstalled).toBe(false)
  })

  test('Cmd/Ctrl+K opens search', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    // Trigger Cmd+K (macOS) or Ctrl+K (Windows/Linux)
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
    await page.keyboard.press(`${modifier}+k`)

    // DocSearch modal should appear
    const modal = page.locator('.DocSearch-Modal')
    await expect(modal).toBeVisible({ timeout: 5000 })
  })
})
