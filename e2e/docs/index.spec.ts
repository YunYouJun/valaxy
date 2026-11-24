// 标准的 Playwright 测试 - 网络拦截已全局启用
import { expect, test } from '@playwright/test'
import { waitForHydration } from '../utils/hydration'

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForHydration(page)
})

test.describe('enter docs', () => {
  test('get started', async ({ page }) => {
    await page.getByRole('link', { name: 'Get Started', exact: true }).click()
    await expect(page).toHaveURL(/\/guide\/getting-started\/?$/)
    await expect(page.locator('h1')).toHaveText('Getting Started')
  })

  test('env url', async ({ page, baseURL }) => {
    expect(page.url()).toContain(baseURL!)
  })

  test('has title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle('Valaxy - A static blog framework for your voice')
  })
})
