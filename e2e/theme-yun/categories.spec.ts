import { expect, test } from '@playwright/test'
import { env } from '../env'

// /categories

test.use({
  baseURL: env['theme-yun'],
})

test.describe('Categories Page', () => {
  test('toggle categories', async ({ page }) => {
    const curCategory = '中文/分类/测试'
    await page.goto(`/categories?category=${curCategory}`)
    await page.waitForSelector('.post-collapse-container')
    // .post-item
    await expect(page.locator('.post-item')).toHaveCount(1)
    // first post
    await expect(page.locator('.post-item .post-title').first()).toHaveText('中文分类测试')
  })
})
