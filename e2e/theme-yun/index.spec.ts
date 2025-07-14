import { expect, test } from '@playwright/test'
import { env } from '../env'
import { commonBeforeEach } from '../utils'

test.use({
  baseURL: env['theme-yun'],
})

commonBeforeEach()

test.describe('Theme Yun', () => {
  test('banner', async ({ page }) => {
    await page.goto('/')
    // refresh to trigger animation
    await page.reload()
    await page.waitForSelector('#yun-banner')
    await expect(page.locator('.char-box')).toHaveCount(6)
    await expect(page.locator('.char-box').nth(0)).toHaveText('云')
  })

  // new version deprecated
  // test('sidebar', async ({ page }) => {
  //   await expect(page.locator('.sidebar')).toContainText('Valaxy Theme Yun')
  // })

  test('post list', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.post-title-link').nth(0)).toHaveText('Hello, Valaxy!')
  })

  test('enter post', async ({ page }) => {
    await page.goto('/')
    await page.click('.post-title-link')
    await page.waitForURL('/posts/hello-valaxy')
    await expect(page.locator('h1')).toHaveText('Hello, Valaxy!')
  })

  test('comment', async ({ page }) => {
    await page.goto('/about')
    await expect(page.locator('.comment')).toHaveCount(1)
  })

  test('search', async ({ page }) => {
    await page.goto('/')
    await page.click('.yun-search-btn')
    await expect(page.locator('.yun-search-input')).toHaveCount(1)
    await page.click('.yun-search-btn')
    await expect(page.locator('.yun-search-input')).toHaveCount(0)
  })
})
