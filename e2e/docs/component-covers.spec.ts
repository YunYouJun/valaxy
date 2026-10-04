import { expect, test } from '@playwright/test'
import { setup, waitForHydration } from '../utils'

setup()

for (const language of ['en', 'zh']) {
  test(`renders the ${language} SVG cover documentation with a bounded, interactive example`, async ({ page }) => {
    await page.goto(`${language === 'zh' ? '/zh' : ''}/guide/post#vue-svg-cover`, { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)
    const cover = page.locator('.hello-valaxy-cover')
    await expect(cover).toBeVisible()
    const box = await cover.boundingBox()
    expect(box!.height).toBeCloseTo(box!.width * 9 / 16, 0)
    await expect(cover.locator('svg')).toBeVisible()
    await expect(cover.locator('img, image')).toHaveCount(0)
    await cover.getByRole('button').click()
    await expect(cover.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    const source = page.locator('details').filter({ hasText: language === 'zh' ? '完整 Vue + SVG 组件代码' : 'Complete Vue + SVG component' })
    await source.locator('summary').click()
    await expect(source.locator('pre')).toContainText('IntersectionObserver')
    await expect(source.locator('pre')).toContainText('<svg')
  })
}
