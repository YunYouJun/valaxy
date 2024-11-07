import { expect, test } from '@playwright/test'
import { env } from '../env'

test.use({
  baseURL: env['theme-yun'],
})

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('Frontmatter', () => {
  test('posted & edited time', async ({ page }) => {
    await page.goto('/posts/hello-valaxy')
    await page.waitForSelector('.post-meta')

    await expect(page.locator('.post-time time')).toHaveCount(2)
    await expect(page.locator('.post-time > .posted-time time')).toHaveText(/\d{4}-\d{2}-\d{2}/)
    await expect(page.locator('.post-time > .edited-time time')).toHaveText(/\d{4}-\d{2}-\d{2}/)
  })

  test('time warning', async ({ page }) => {
    await page.goto('/test/time_warning')

    await expect(page.locator('.yun-time-warning')).toHaveCount(1)
  })

  test('word count & reading time', async ({ page }) => {
    await page.goto('/posts/hello-valaxy')

    await expect(page.locator('.post-counter > .word-count span')).toHaveText(/\d+/)
    await expect(page.locator('.post-counter > .reading-time time')).toHaveText(/m|h/)
  })
})
