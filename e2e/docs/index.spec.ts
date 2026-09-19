// 标准的 Playwright 测试 - 网络拦截已全局启用
import { expect, test } from '@playwright/test'
import { env } from '../env'

test.use({
  baseURL: env.docs,
})

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('enter docs', () => {
  test('get started', async ({ page }) => {
    await page.getByRole('link', { name: 'Get Started', exact: true }).click()
    await expect(page).toHaveURL(/\/guide\/getting-started\/?$/)
    await expect(page.locator('h1')).toHaveText('Getting Started')
  })

  test('env url', async ({ page }) => {
    expect(page.url()).toContain(env.docs)
  })

  test('has title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle('Valaxy - A blog framework for your voice')
  })
})
