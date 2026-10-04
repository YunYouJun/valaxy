import { readFile } from 'node:fs/promises'
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
    const textBounds = await cover.locator('svg text').evaluateAll(elements => elements.map((element) => {
      const box = (element as SVGGraphicsElement).getBBox()
      return { right: box.x + box.width, bottom: box.y + box.height }
    }))
    for (const bounds of textBounds) {
      expect(bounds.right).toBeLessThan(960)
      expect(bounds.bottom).toBeLessThan(540)
    }
    await expect(cover.locator('img, image')).toHaveCount(0)
    await cover.getByRole('button').click()
    await expect(cover.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    const source = page.locator('details').filter({ hasText: language === 'zh' ? '完整 Vue + SVG 组件代码' : 'Complete Vue + SVG component' })
    await source.locator('summary').click()
    await expect(source.locator('pre')).toContainText('IntersectionObserver')
    await expect(source.locator('pre')).toContainText('<svg')
  })
}

test('exports the same SVG scene as a nonempty 1200 × 630 PNG without changing its state', async ({ page }, testInfo) => {
  await page.goto('/guide/post#vue-svg-cover', { waitUntil: 'domcontentloaded' })
  await waitForHydration(page)
  const cover = page.locator('.hello-valaxy-cover')
  await cover.getByRole('button').click()
  await expect(cover.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export PNG', exact: true }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('hello-valaxy-og.png')
  const png = await readFile((await download.path())!)
  expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
  expect(png.readUInt32BE(16)).toBe(1200)
  expect(png.readUInt32BE(20)).toBe(630)
  const pixels = await page.evaluate(async (base64) => {
    const image = new Image()
    image.src = `data:image/png;base64,${base64}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(image, 0, 0)
    const corner = Array.from(ctx.getImageData(10, 10, 1, 1).data)
    const title = ctx.getImageData(60, 320, 800, 130).data
    let bright = 0
    for (let i = 0; i < title.length; i += 4) {
      if (title[i] > 220 && title[i + 1] > 220 && title[i + 2] > 220)
        bright++
    }
    return { corner, bright }
  }, png.toString('base64'))
  expect(pixels.corner[3]).toBe(255)
  expect(pixels.corner[2]).toBeGreaterThan(pixels.corner[0])
  expect(pixels.bright).toBeGreaterThan(1000)
  await expect(cover.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.valaxy-svg-export [role="alert"]')).toHaveCount(0)
  await testInfo.attach('hello-valaxy-og.png', { body: png, contentType: 'image/png' })
})
