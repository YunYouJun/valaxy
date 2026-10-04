import { expect, test } from '@playwright/test'
import { setup } from '../../utils'
import { testFootnotePreviews } from '../../utils/footnotes'

setup('theme-yun')

testFootnotePreviews('/test/footnotes')

test('mounts comments after article hydration without losing the script', async ({ page }) => {
  const warnings: string[] = []
  page.on('console', (message) => {
    if (['warning', 'error'].includes(message.type()) && /hydration/i.test(message.text()))
      warnings.push(message.text())
  })
  page.on('pageerror', error => warnings.push(error.message))
  // Keep the third-party network deterministic while exercising the real mount timing.
  await page.route('https://utteranc.es/client.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: 'document.currentScript.dataset.loaded = "true"',
  }))
  await page.reload({ waitUntil: 'domcontentloaded' })
  const commentScript = page.locator('.yun-comment script[src="https://utteranc.es/client.js"]')
  await expect(commentScript).toHaveAttribute('data-loaded', 'true')
  await page.locator('.va-footnote-preview').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(commentScript).toHaveCount(1)
  expect(warnings).toEqual([])
})
