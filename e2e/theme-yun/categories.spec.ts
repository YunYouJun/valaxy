import { expect, test } from '@playwright/test'
import { env } from '../env'

// /categories

test.use({
  baseURL: env['theme-yun'],
})

test.describe('Categories Page', () => {
  test('toggle categories', async ({ page }) => {
    const curCategory = '中文/分类/测试'
    const searchParams = new URLSearchParams()
    searchParams.set('category', curCategory)

    const url = `/categories?${searchParams.toString()}`
    await page.goto(url)
    // .post-item
    await expect(page.locator('.post-item')).toHaveCount(1)
    // first post
    await expect(page.locator('.post-item .post-title').first()).toHaveText('中文分类测试')
  })
})
