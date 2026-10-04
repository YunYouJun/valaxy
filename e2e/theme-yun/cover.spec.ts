import { expect, test } from '@playwright/test'
import { setup } from '../utils'
import { waitForHydration } from '../utils/hydration'

setup('theme-yun')

test('keeps component-cover interactions separate from card navigation', async ({ page }) => {
  await page.setViewportSize({ width: 855, height: 927 })
  await page.goto('/')
  await waitForHydration(page)
  const card = page.locator('.post-card-wrapper').filter({ has: page.locator('.hello-valaxy-cover') }).first()
  const cover = card.locator('.hello-valaxy-cover')
  const button = cover.getByRole('button')
  await expect(cover).toHaveAttribute('data-context', 'card')
  await expect(card.locator('img')).toHaveCount(0)
  const coverBounds = await cover.boundingBox()
  for (const text of await cover.locator('svg text').all()) {
    const bounds = await text.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(coverBounds!.x)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(coverBounds!.x + coverBounds!.width)
  }
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'true')
  await expect(cover.locator('.hello-valaxy-constellation')).toHaveCSS('stroke-dashoffset', '0px')
  await expect(cover.locator('.hello-valaxy-orbit')).toHaveCSS('animation-play-state', 'running')
  await page.locator('footer').scrollIntoViewIfNeeded()
  await expect(cover.locator('.hello-valaxy-orbit')).toHaveCSS('animation-play-state', 'paused')
  await expect(page).toHaveURL(/\/$/)
  await card.locator('.post-title-link').click()
  await expect(page).toHaveURL(/\/posts\/hello-valaxy\/?$/)
})

test('renders the header and Markdown component with independent state', async ({ page }) => {
  const hydrationErrors: string[] = []
  page.on('console', (message) => {
    if (/hydration|mismatch/i.test(message.text()))
      hydrationErrors.push(message.text())
  })
  await page.goto('/posts/hello-valaxy')
  await waitForHydration(page)
  const header = page.locator('.hello-valaxy-cover[data-context="page"]')
  const body = page.locator('.hello-valaxy-cover[data-context="body"]')
  await expect(header).toBeVisible()
  await expect(body).toBeVisible()
  const bodyBox = await body.boundingBox()
  const svgBox = await body.locator('svg').boundingBox()
  expect(svgBox!.width).toBeCloseTo(bodyBox!.width, 0)
  await expect(page.locator('.hello-valaxy-cover img, .valaxy-cover-image')).toHaveCount(0)
  const ids = await page.locator('.hello-valaxy-cover svg [id]').evaluateAll(elements => elements.map(element => element.id))
  expect(new Set(ids).size).toBe(ids.length)
  await header.getByRole('button').focus()
  await page.keyboard.press('Enter')
  await expect(header.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  await expect(body.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  expect(hydrationErrors).toEqual([])
})

test('fits component covers on mobile with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/posts/hello-valaxy')
  await waitForHydration(page)
  const cover = page.locator('.hello-valaxy-cover[data-context="page"]')
  const coverBounds = await cover.boundingBox()
  for (const text of await cover.locator('svg text').all()) {
    const bounds = await text.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(coverBounds!.x)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(coverBounds!.x + coverBounds!.width)
  }
  await cover.getByRole('button').click()
  await expect(cover.locator('.hello-valaxy-orbit')).toHaveCSS('animation-name', 'none')
  await expect(cover.locator('.hello-valaxy-constellation')).toHaveCSS('transition-duration', '0s')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
