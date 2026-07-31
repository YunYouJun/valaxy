import { expect, test } from '@playwright/test'
import { setup } from '../utils'

setup('theme-yun')

test.describe('Markdown iframe', () => {
  test('preserves its declared aspect ratio when constrained by the post width', async ({ page }) => {
    await page.goto('/test/iframe')

    for (const { id, ratio } of [
      { id: 'responsive-landscape', ratio: 1080 / 608 },
      { id: 'responsive-portrait', ratio: 608 / 1080 },
    ]) {
      const box = await page.locator(`#${id}`).boundingBox()
      expect(box).not.toBeNull()
      expect(box!.width / box!.height).toBeCloseTo(ratio, 2)
    }
  })

  test('leaves explicitly sized and dimensionless iframes unchanged', async ({ page }) => {
    await page.goto('/test/iframe')

    const explicitlySized = page.locator('#explicit-height')
    await expect(explicitlySized).toHaveCSS('height', '240px')

    const dimensionless = page.locator('#dimensionless')
    await expect(dimensionless).not.toHaveAttribute('data-va-responsive-iframe')
    await expect(dimensionless).toHaveCSS('height', '150px')
  })
})
