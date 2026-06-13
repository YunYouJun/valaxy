import { expect, test } from '@playwright/test'
import { env } from '../env'
import { waitForHydration } from '../utils'

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

    await page.goto('/', { waitUntil: 'domcontentloaded' })
    // Ensure the Vue app has mounted (the async mount chain in main.ts is the
    // real readiness signal, not the network going idle), so the search
    // component's listeners are registered. See e2e/utils/hydration.ts.
    await waitForHydration(page)

    // Search button should be visible
    const searchBtn = page.locator('.PressSearchButton')
    await searchBtn.waitFor({ state: 'visible' })

    // Click search button
    await searchBtn.click()

    // DocSearch modal should appear (Algolia DocSearch creates .DocSearch-Modal).
    // The modal is an async-loaded component; under full-suite parallel load the
    // dev server compiles its chunk on demand, so allow a generous budget — the
    // modal's appearance is the only signal there is no deterministic event for.
    const modal = page.locator('.DocSearch-Modal')
    await expect(modal).toBeVisible({ timeout: 15000 })

    // The "not installed" warning should NOT appear
    const algoliaNotInstalled = warnings.some(w =>
      w.includes('valaxy-addon-algolia is not installed'),
    )
    expect(algoliaNotInstalled).toBe(false)
  })

  test('Cmd/Ctrl+K opens search', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    // The Cmd/Ctrl+K handler is an `onKeyStroke` registered during the search
    // component's setup, which only runs after `app.mount()`. Wait for the app
    // to finish mounting/hydrating before pressing, otherwise the keystroke is
    // lost (root cause of the previous flakiness).
    await waitForHydration(page)

    // Trigger Cmd+K (macOS) or Ctrl+K (Windows/Linux)
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
    await page.keyboard.press(`${modifier}+k`)

    // DocSearch modal should appear. Generous budget: the modal is an
    // async-loaded component compiled on demand by the dev server, which can be
    // slow under full-suite parallel load (this is render/compile latency, not
    // the listener race that `waitForHydration` above already resolves).
    const modal = page.locator('.DocSearch-Modal')
    await expect(modal).toBeVisible({ timeout: 15000 })
  })
})
