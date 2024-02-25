import { expect, test } from '@playwright/test'
import { env } from '../env'

test.use({
  baseURL: env['theme-yun'],
})

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('Client Redirect', () => {
  test('redirect/old1', async ({ page }) => {
    await page.goto('/redirect/old1')
    await page.waitForURL('/posts/redirect')
    expect(page.url()).toContain('posts/redirect')
  })

  test('redirect/old2', async ({ page }) => {
    await page.goto('/redirect/old2')
    await page.waitForURL('/posts/redirect')
    expect(page.url()).toContain('posts/redirect')
  })

  test('foo', async ({ page }) => {
    await page.goto('/foo')
    await page.waitForURL('/about')
    expect(page.url()).toContain('about')
  })
})
