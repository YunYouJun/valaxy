import { expect, test } from '@playwright/test'
import { env } from '../env'

test.use({
  baseURL: env['theme-yun'],
})

test.beforeEach(async ({ page }) => {
  await page.goto('/posts/date')
})

test.describe('Frontmatter', () => {
  test('time format validation', async ({ page }) => {
    await expect(page.locator('#text-time-format-1 time')).toHaveText('20230719')
    await expect(page.locator('#text-time-format-2 time')).toHaveText('20210301120000')
    await expect(page.locator('#text-time-format-3 time')).toHaveText('2021/12/03 01:07')
  })

  test('timezone format validation', async ({ page }) => {
    await expect(page.locator('#text-time-zone-1 time')).toHaveText('2004-06-15 18:00:00+02:00 GMT+2')
    await expect(page.locator('#text-time-zone-2 time')).toHaveText('2004-06-15 18:00:00+02:00 GMT+2')
    await expect(page.locator('#text-time-zone-3 time')).toHaveText('2004-06-16 00:00:00+08:00 GMT+8')
    await expect(page.locator('#text-time-zone-4 time')).toHaveText('2004-06-16 02:00:00+02:00 GMT+2')
    await expect(page.locator('#text-time-zone-5 time')).toHaveText('2004-06-15 23:00:00+07:00 GMT+7')
    await expect(page.locator('#text-time-zone-6 time')).toHaveText('2004-06-16 06:00:00+08:00 GMT+8')
    await expect(page.locator('#text-time-zone-6 time')).toHaveText('2004-06-16 06:00:00+08:00 GMT+8')
    await expect(page.locator('#text-time-zone-7 time')).toHaveText('2004-06-16 00:00:00+02:00 GMT+2')
    await expect(page.locator('#text-time-zone-8 time')).toHaveText('2004-06-16 08:00:00+08:00 GMT+8')
  })
})
