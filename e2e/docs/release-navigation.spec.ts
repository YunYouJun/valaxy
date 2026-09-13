import { expect, test } from '@playwright/test'
import { env } from '../env'

test.use({ baseURL: env.docs })

test('keeps the hydrated app mounted when leaving the release layout', async ({ page }) => {
  await page.goto('/zh/release/')
  await page.getByRole('link', { name: '开始创作', exact: true }).click()
  await expect(page).toHaveURL(/\/zh\/guide\/getting-started\/?$/)
  await expect(page.locator('#app')).toBeVisible()
  await expect(page.getByRole('heading', { name: '开始', exact: true })).toBeVisible()

  await page.getByRole('link', { name: 'VALAXY', exact: true }).click()
  await expect(page).toHaveURL(/\/zh\/$/)
  await expect(page.getByRole('heading', { name: 'VALAXY', exact: true })).toBeVisible()
})
