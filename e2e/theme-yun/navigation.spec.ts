import { expect, test } from '@playwright/test'
import { env } from '../env'
import { waitForHydration } from '../utils/hydration'

test.use({
  baseURL: env['theme-yun-dev'],
})

test('vertically aligns the Strato mobile menu with the top navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/test/strato-nav', { waitUntil: 'domcontentloaded' })
  await waitForHydration(page)

  const fixture = page.getByTestId('strato-nav-fixture')
  const hamburger = fixture.getByRole('button', { name: 'mobile navigation' })
  const topNav = fixture.locator('.yun-nav-menu')

  await expect(hamburger).toBeVisible()
  await expect(topNav).toBeVisible()

  const alignment = await fixture.evaluate((element) => {
    const isVisible = (node: Element) => {
      const style = getComputedStyle(node)
      const rect = node.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
    }

    const hamburgerTop = element.querySelector('.sidebar-toggle')!.getBoundingClientRect().top
    const navControlTops = [...element.querySelectorAll('.yun-nav-menu button')]
      .filter(isVisible)
      .map(node => node.getBoundingClientRect().top)

    return { hamburgerTop, navControlTops }
  })

  expect(alignment.navControlTops.length).toBeGreaterThan(0)
  expect(alignment.navControlTops.every(top => top === alignment.hamburgerTop)).toBe(true)

  const stratoHamburgerStyle = await hamburger.evaluate((element) => {
    const bar = element.querySelector('.vt-hamburger-top')!
    const container = element.querySelector('.vt-hamburger-container')!
    return {
      buttonColor: getComputedStyle(element).color,
      barBg: getComputedStyle(bar).backgroundColor,
      containerTransform: getComputedStyle(container).transform,
    }
  })
  expect(stratoHamburgerStyle.barBg).toBe(stratoHamburgerStyle.buttonColor)
  expect(stratoHamburgerStyle.barBg).not.toBe('rgb(0, 120, 231)')
  expect(stratoHamburgerStyle.containerTransform).toBe('matrix(0.82, 0, 0, 0.82, 0, 0)')

  await hamburger.click()
  await expect(hamburger).toHaveAttribute('aria-expanded', 'true')
  expect(await hamburger.evaluate(element => element.getBoundingClientRect().top)).toBe(alignment.hamburgerTop)
})

test('aligns Nimbo mobile hamburger color and scale with action buttons', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 800 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForHydration(page)

  const hamburger = page.locator('.yun-nav-menu .vt-hamburger.yun-action-btn')
  await expect(hamburger).toBeVisible()

  const nimboHamburgerStyle = await hamburger.evaluate((element) => {
    const bar = element.querySelector('.vt-hamburger-top')!
    const container = element.querySelector('.vt-hamburger-container')!
    return {
      buttonColor: getComputedStyle(element).color,
      barBg: getComputedStyle(bar).backgroundColor,
      containerTransform: getComputedStyle(container).transform,
    }
  })
  expect(nimboHamburgerStyle.barBg).toBe(nimboHamburgerStyle.buttonColor)
  expect(nimboHamburgerStyle.barBg).not.toBe('rgb(0, 120, 231)')
  expect(nimboHamburgerStyle.containerTransform).toBe('matrix(0.82, 0, 0, 0.82, 0, 0)')
})

test('hides responsive menu buttons at their desktop breakpoints', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForHydration(page)

  await expect(page.getByRole('button', { name: 'mobile navigation' })).toBeHidden()

  await page.setViewportSize({ width: 768, height: 768 })
  await page.goto('/test/strato-nav', { waitUntil: 'domcontentloaded' })
  await waitForHydration(page)

  const fixture = page.getByTestId('strato-nav-fixture')
  await expect(fixture.getByRole('button', { name: 'mobile navigation' })).toBeHidden()
  await expect(fixture.locator('a[href="/"]')).toBeVisible()
})
