import { expect, test } from '@playwright/test'

test.use({ javaScriptEnabled: false })

test('serves release fonts only on the release page before hydration', async ({ page }) => {
  const releaseFonts = ['Literata', 'LXGW WenKai Screen', 'Maple Mono']
  const fontFamilies = () => page.evaluate(() => Array.from(document.fonts, font => font.family.replace(/["']/g, '')))

  await page.goto('/')
  const homeFonts = await fontFamilies()
  for (const font of releaseFonts)
    expect(homeFonts).not.toContain(font)

  await page.goto('/release/v1/')
  await expect(page.locator('.release-page')).toHaveCSS('font-family', /Literata/)
  expect(await fontFamilies()).toEqual(expect.arrayContaining(releaseFonts))
})
