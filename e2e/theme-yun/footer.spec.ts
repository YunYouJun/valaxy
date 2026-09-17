import { expect, test } from '@playwright/test'
import { env } from '../env'

test.use({ baseURL: env['theme-yun-dev'] })

test('keeps the footer usable when visitor statistics fail to load', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/busuanzi.pure.mini.js', route => route.abort())

  await page.goto('/tags/')
  await expect(page.locator('.yun-footer')).toBeVisible()
  await expect(page.locator('.yun-footer')).toContainText('本站已运行')
  await expect(page.locator('#busuanzi_value_site_pv')).toHaveCount(0)
  await expect(page.locator('#busuanzi_value_site_uv')).toHaveCount(0)
  expect(errors).toEqual([])
})
