import { expect, test } from '@playwright/test'
import { env } from '../env'

test.use({ baseURL: env.docs, viewport: { width: 1440, height: 900 } })

test('staggers the hero entrance and reveals sections on scroll', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await expect(page.locator('.hero-heading')).toHaveCSS('animation-name', 'press-enter')
  await expect(page.locator('.hero-heading')).toHaveCSS('animation-delay', '0.07s')
  await expect(page.locator('.press-home-command')).toHaveCSS('animation-delay', '0.28s')
  await expect(page.locator('.press-features')).toHaveCSS('animation-timeline', 'view()')
  // The entrance settles on fully visible content.
  await expect(page.locator('.hero-heading')).toHaveCSS('opacity', '1')
})

test('keeps the homepage still when reduced motion is preferred', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  for (const selector of ['.hero-heading', '.press-home-command', '.press-features', '.home-ecosystem .press-reveal'])
    await expect(page.locator(selector).first()).toHaveCSS('animation-name', 'none')
  await expect(page.locator('.hero-heading')).toHaveCSS('opacity', '1')
})

test('expands and collapses the sponsor list', async ({ page }) => {
  await page.goto('/')
  const sponsors = page.locator('.home-sponsors')
  await expect(sponsors.getByRole('heading', { name: 'Made possible by our sponsors' })).toBeVisible()
  const toggle = sponsors.getByRole('button', { name: 'Show all sponsors' })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(sponsors.locator('.sponsors-list')).toHaveCSS('max-height', '340px')
  await toggle.click()
  await expect(sponsors.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true')
  await expect(sponsors.locator('.sponsors-list')).toHaveCSS('max-height', 'none')
})
