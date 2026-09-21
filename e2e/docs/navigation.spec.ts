import { expect, test } from '@playwright/test'
import pkg from '../../packages/valaxy/package.json' with { type: 'json' }
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
  const hamburger = page.getByRole('button', { name: '打开导航', exact: true })

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
  await expect(page.getByRole('button', { name: 'Open navigation', exact: true })).toBeHidden()
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

test('keeps only one dropdown open when moving quickly between navigation and languages', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 })
  await page.goto('/zh/guide/why')
  await page.waitForLoadState('networkidle')

  const navbar = page.locator('.pr-navbar')
  const version = navbar.getByRole('button', { name: pkg.version, exact: true })
  const languages = navbar.getByRole('button', { name: '切换语言', exact: true })
  const ecosystem = navbar.getByRole('button', { name: '生态', exact: true })

  // Record transient overlaps: retrying a hidden assertion can miss the
  // outgoing menu remaining visible during its pointer-leave delay.
  const observation = await navbar.evaluateHandle((element) => {
    let maxVisibleMenus = 0
    const observer = new MutationObserver(() => {
      const visibleMenus = [...element.querySelectorAll('.press-nav-menu-content')]
        .filter(menu => menu.getClientRects().length > 0)
      maxVisibleMenus = Math.max(maxVisibleMenus, visibleMenus.length)
    })
    observer.observe(element, { childList: true, subtree: true, attributes: true })
    return () => {
      observer.disconnect()
      return maxVisibleMenus
    }
  })

  for (let i = 0; i < 3; i++) {
    for (const trigger of [version, languages, version, ecosystem, languages]) {
      await trigger.hover()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    }
  }

  const english = navbar.getByRole('link', { name: 'English', exact: true })
  await english.hover()
  await expect(english).toBeVisible()
  await page.mouse.move(0, 400)
  await expect(navbar.locator('.press-nav-menu-content')).toHaveCount(0)

  expect(await observation.evaluate(stop => stop())).toBe(1)
  await observation.dispose()
})
