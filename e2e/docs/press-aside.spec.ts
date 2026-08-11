import { expect, test } from '@playwright/test'
import { env } from '../env'

test.use({
  baseURL: env.docs,
  colorScheme: 'dark',
  deviceScaleFactor: 2,
  viewport: { width: 817, height: 649 },
})

test('closes the reading progress border after a rapid scroll burst', async ({ page }) => {
  await page.goto('/zh/guide/why')
  await page.waitForLoadState('networkidle')

  const trigger = page.locator('.toc-btn')
  const progress = trigger.locator('.toc-progress-value:not(.toc-progress-complete)')
  const complete = trigger.locator('.toc-progress-complete')

  await expect(trigger).toBeVisible()
  await page.evaluate(() => {
    const scrollContainer = document.scrollingElement || document.documentElement
    const scrollableHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight
    scrollContainer.scrollTop = scrollableHeight * 0.9
    window.dispatchEvent(new Event('scroll'))
  })
  await page.waitForTimeout(10)
  await page.evaluate(() => {
    const scrollContainer = document.scrollingElement || document.documentElement
    scrollContainer.scrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight
    window.dispatchEvent(new Event('scroll'))
  })
  await page.waitForTimeout(200)
  await expect(trigger).toHaveAttribute('aria-label', /100%/)
  await expect(progress).toBeHidden()
  await expect(complete).toBeVisible()
  await expect(complete).not.toHaveAttribute('stroke-dasharray')
})
