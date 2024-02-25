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
    // Click the get started button
    await page.click('.sese-btn')
    // wait page load
    await page.waitForURL(`${env.docs}/guide/getting-started`)
    // Expect a new url
    await expect(page.locator('h1')).toHaveText('Getting Started')
  })

  test('env url', async ({ page }) => {
    expect(page.url()).toContain(env.docs)
  })

  test('has title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle('Valaxy - Next Generation Static Blog Framework')
  })
})
