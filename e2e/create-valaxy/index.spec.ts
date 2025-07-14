import { expect, test } from '@playwright/test'
import { env } from '../env'

test.use({
  baseURL: env['create-valaxy'],
  locale: 'zh-CN',
})

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('Create Valaxy Demo', () => {
  test('basic', async ({ page }) => {
    expect(page.url()).toContain(env['create-valaxy'])
  })

  test('banner', async ({ page }) => {
    await page.waitForSelector('#yun-banner')
    await expect(page.locator('.char-box')).toHaveCount(6)
    await expect(page.locator('.char-box').nth(0)).toHaveText('云')
  })

  // new version yun deprecated sidebar
  // test('sidebar', async ({ page }) => {
  //   await page.waitForSelector('.sidebar')
  //   await expect(page.locator('.sidebar')).toContainText('Valaxy Theme Yun')
  // })

  test('post list', async ({ page }) => {
    await page.waitForSelector('.post-title-link')
    await expect(page.locator('.post-title-link')).toHaveText('Hello, Valaxy!')
  })

  test('enter post', async ({ page }) => {
    await page.click('.post-title-link')
    await page.waitForURL('/posts/hello-valaxy')
    await expect(page.locator('h1')).toHaveText('Hello, Valaxy!')
  })
})
