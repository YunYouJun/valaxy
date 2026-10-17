import { expect, test } from '@playwright/test'

// No baseURL here: the dev and SSG Playwright configs each provide one.
test.use({ viewport: { width: 1440, height: 900 } })

test('sends /release/ to the latest release page', async ({ page }) => {
  await page.goto('/release/')
  await expect(page).toHaveURL(/\/release\/v1\/$/)
  await expect(page.locator('.galaxy-hero')).toBeVisible()
})

test('opens on the plate with the nav laid over it, then a solid nav past it', async ({ page }) => {
  await page.goto('/release/v1/')
  await expect(page.locator('.galaxy-hero .hero-canvas')).toBeVisible()
  await expect(page.locator('.hero-plate')).toContainText('Valaxy 1.0')
  await expect(page.locator('.release-nav')).toHaveClass(/is-over-plate/)
  await page.locator('#devtools').scrollIntoViewIfNeeded()
  await expect(page.locator('.release-nav')).not.toHaveClass(/is-over-plate/)
})

test('sends a line into the galaxy and turns it into a postcard', async ({ page }) => {
  await page.goto('/zh/release/v1/')
  await page.getByLabel('写一句话，放进星系').fill('今天也写了一篇博客')
  await page.getByRole('button', { name: '放进星系', exact: true }).click()
  await expect(page.locator('.wish-status [role="status"]')).toHaveText('9 个字已加入星系')

  await page.getByRole('button', { name: '把这句话做成明信片' }).click()
  const dialog = page.getByRole('dialog', { name: '来自文字星系的明信片' })
  await expect(dialog).toBeVisible()
  await expect.poll(() => dialog.locator('canvas').evaluate(el => (el as HTMLCanvasElement).width)).toBe(1500)
  const download = page.waitForEvent('download')
  await dialog.getByRole('button', { name: '下载明信片' }).click()
  expect((await download).suggestedFilename()).toMatch(/^valaxy-postcard-\d{5}\.png$/)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('sets a title in movable type and prints numbered impressions', async ({ page }) => {
  await page.goto('/release/v1/')
  const sheet = page.locator('.type-sheet')
  await page.getByLabel('Write a title').fill('Hello, world')
  await page.getByRole('button', { name: 'Set and print' }).click()
  await expect(sheet.locator('.impression')).toHaveText('Hello, world')
  await expect(sheet.locator('.colophon')).toContainText('Printing no. 1')
  await expect(page.locator('.type-stick .stick-sort.is-landed')).toHaveCount(12)
  // Let the platen lift and the press free up before the second run.
  await expect(page.locator('.type-press')).not.toHaveClass(/is-pressing/)
  await expect(page.getByRole('button', { name: 'Set and print' })).toBeEnabled()
  await page.getByRole('button', { name: 'Set and print' }).click()
  await expect(sheet.locator('.colophon')).toContainText('Printing no. 2', { timeout: 15_000 })
})

test('switches the section to the theme of the chosen planet', async ({ page }) => {
  await page.goto('/release/v1/')
  const section = page.locator('.theme-section')
  const planets = section.locator('.planet')
  await expect(planets).toHaveCount(6)
  await expect(planets.filter({ hasText: 'Yun' })).toHaveAttribute('aria-pressed', 'true')
  // Hovering the instrument stops the orbit, as it does for a person aiming at a planet.
  await section.locator('.orrery').hover({ position: { x: 4, y: 4 } })
  await planets.filter({ hasText: 'Arknights' }).click()
  await expect(planets.filter({ hasText: 'Arknights' })).toHaveAttribute('aria-pressed', 'true')
  await expect(section).toHaveCSS('background-color', 'rgb(24, 25, 28)')
  await expect(section.locator('.theme-card img')).toHaveAttribute('src', '/themes/arknights-preview.webp')
  await expect(section.locator('.theme-card figcaption')).toContainText('Arknights')
})

test('keeps everything still and usable when reduced motion is preferred', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/zh/release/v1/')
  await expect(page.getByRole('button', { name: '重播开场动画' })).toBeHidden()
  // The galaxy is drawn in its finished state rather than left blank.
  await expect.poll(() => page.locator('.galaxy-hero .hero-canvas').evaluate((el) => {
    const canvas = el as HTMLCanvasElement
    const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data
    // The bare plate, grain and graticule stay below r = 90; drawn stars do not.
    let lit = 0
    for (let i = 0; i < data.length; i += 4 * 7) {
      if (data[i] > 90)
        lit++
    }
    return lit
  })).toBeGreaterThan(200)

  await page.getByLabel('写下一个标题').fill('你好，世界')
  await page.getByRole('button', { name: '排版并印刷' }).click()
  await expect(page.locator('.impression')).toHaveText('你好，世界', { timeout: 1000 })
})
