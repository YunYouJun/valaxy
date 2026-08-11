import { expect, test } from '@playwright/test'
import { env } from '../env'

test.use({
  baseURL: env.docs,
  colorScheme: 'dark',
})

test('uses the screen menu before tablet navigation can wrap', async ({ page }) => {
  await page.setViewportSize({ width: 817, height: 649 })
  await page.goto('/zh/guide/why')
  await page.waitForLoadState('networkidle')

  const navbar = page.locator('.pr-navbar')
  const menu = page.locator('.pr-nav-bar-menu')
  const hamburger = page.getByRole('button', { name: 'mobile navigation' })

  await expect(menu).toBeHidden()
  await expect(hamburger).toBeVisible()
  await expect(page.locator('.PressSearchButton-text')).toBeHidden()
  await expect(page.locator('.PressSearchButton-keys')).toBeHidden()

  expect(await navbar.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)

  await hamburger.click()
  await expect(page.locator('.pr-NavScreen')).toBeVisible()
  await expect(page.getByRole('button', { name: '指南' })).toBeVisible()
})

test('keeps the English desktop menu on one line at 1024px', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 700 })
  await page.goto('/guide/why')
  await page.waitForLoadState('networkidle')

  await expect(page.locator('.pr-nav-bar-menu')).toBeVisible()
  await expect(page.getByRole('button', { name: 'mobile navigation' })).toBeHidden()
  await expect(page.locator('.PressSearchButton-text')).toBeHidden()

  const layout = await page.locator('.pr-navbar').evaluate((navbar) => {
    const brand = navbar.querySelector('.pr-navbar-brand')!.getBoundingClientRect()
    const actions = navbar.querySelector('.pr-navbar-actions')!.getBoundingClientRect()
    const items = [...navbar.querySelectorAll<HTMLElement>('.press-nav-item-link, .pr-nav-bar-menu .group .button')]

    return {
      fits: navbar.scrollWidth <= navbar.clientWidth,
      overlaps: brand.right > actions.left,
      wraps: items.some(item => getComputedStyle(item).whiteSpace !== 'nowrap'),
    }
  })

  expect(layout).toEqual({
    fits: true,
    overlaps: false,
    wraps: false,
  })
})

test('expands the search control on wide screens', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 })
  await page.goto('/guide/why')
  await page.waitForLoadState('networkidle')

  await expect(page.locator('.pr-nav-bar-menu')).toBeVisible()
  await expect(page.locator('.PressSearchButton-text')).toBeVisible()
  await expect(page.locator('.PressSearchButton-keys')).toBeVisible()
})
