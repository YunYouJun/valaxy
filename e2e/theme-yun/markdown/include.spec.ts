import { expect, test } from '@playwright/test'
import { setup } from '../../utils'

setup('theme-yun')

test.describe('Markdown File Inclusion by @include', () => {
  test('test/markdown-file-inclusion', async ({ page }) => {
    await page.goto('/test/markdown-file-inclusion')

    await page.waitForSelector('.markdown-body')
    await expect(page.locator('h1#hello-included')).toHaveText('Hello Included')

    // tip custom-block, count > 1
    expect(await page.locator('.tip.custom-block').count()).toBeGreaterThan(1)
  })
})
