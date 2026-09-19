import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import pkg from '../../packages/valaxy/package.json' with { type: 'json' }

const pageErrors = new WeakMap<Page, string[]>()

test.beforeEach(async ({ page }) => {
  const errors: string[] = []
  pageErrors.set(page, errors)
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (['warning', 'error'].includes(message.type()) && /hydration/i.test(message.text()))
      errors.push(message.text())
  })
  await page.goto('/zh/release/')
  // Vue marks the mounted container for both SPA and SSR hydration.
  await expect.poll(() => page.locator('#app').evaluate(el => !!(el as HTMLElement & { __vue_app__?: unknown }).__vue_app__)).toBe(true)
})

test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page)).toEqual([])
})

test('keeps the hydrated app mounted across repeated layout changes', async ({ page }) => {
  for (let i = 0; i < 2; i++) {
    await page.getByRole('link', { name: '开始创作', exact: true }).click()
    await expect(page).toHaveURL(/\/zh\/guide\/getting-started\/?$/)
    await expect(page.locator('#app')).toBeVisible()
    await expect(page.getByRole('heading', { name: '开始', exact: true })).toBeVisible()

    await page.getByRole('link', { name: 'VALAXY', exact: true }).click()
    await expect(page).toHaveURL(/\/zh\/$/)
    await expect(page.getByRole('heading', { name: 'VALAXY', exact: true })).toBeVisible()

    const mobile = page.getByRole('button', { name: '打开导航', exact: true })
    if (await mobile.isVisible())
      await mobile.click()
    await page.getByRole('button', { name: pkg.version, exact: true }).click()
    await page.getByRole('link', { name: 'Valaxy 1.0', exact: true }).click()
    await expect(page).toHaveURL(/\/zh\/release\/$/)
    await expect(page.locator('#release-title')).toBeVisible()
  }
})

test('opens and closes hydrated portals before leaving the layout', async ({ page }) => {
  const mobile = page.getByRole('button', { name: '打开导航', exact: true })
  if (await mobile.isVisible())
    await mobile.click()
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: '切换语言', exact: true }).click()
    const menu = page.locator('#valaxy-teleports [role="menu"]')
    await expect(menu).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
  }
  const closeMobile = page.getByRole('button', { name: '关闭导航', exact: true })
  if (await closeMobile.isVisible())
    await closeMobile.click()

  // DocSearch is mounted on the client and does not participate in Vue SSR.
  for (let i = 0; i < 2; i++) {
    await page.locator('.PressSearchButton').click()
    await expect(page.locator('.DocSearch-Modal')).toBeVisible({ timeout: 15000 })
    await page.getByRole('button', { name: 'Close', exact: true }).click()
    await expect(page.locator('.DocSearch-Modal')).toBeHidden()
  }
  await page.getByRole('link', { name: '开始创作', exact: true }).click()
  await expect(page.getByRole('heading', { name: '开始', exact: true })).toBeVisible()
  await expect(page.locator('#app')).toBeVisible()
})
