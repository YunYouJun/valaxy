import { expect, test } from '@playwright/test'

for (const route of ['/examples/mermaid', '/zh/examples/mermaid']) {
  test(`optional Mermaid addon renders and opens an accessible viewer: ${route}`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error')
        errors.push(message.text())
    })
    await page.goto(route)
    const diagram = page.locator('.diagram-card').first()
    await expect(diagram).toHaveAttribute('aria-busy', 'false')
    await expect(diagram.locator('.diagram-svg svg')).toBeVisible()
    await expect(page.locator('vite-error-overlay')).toHaveCount(0)

    const expand = diagram.locator('.diagram-expand')
    await expand.click()
    const dialog = diagram.locator('dialog')
    await expect(dialog).toBeVisible()
    // Opening moves the original SVG; it must not duplicate IDs or lose links.
    await expect(diagram.locator('.diagram-preview .diagram-svg')).toHaveCount(0)
    await expect(dialog.locator('.diagram-svg svg')).toBeVisible()

    const scale = dialog.locator('output')
    const initialScale = (await scale.textContent()) || ''
    await dialog.locator('.diagram-canvas').press('+')
    await expect(scale).not.toHaveText(initialScale)
    await dialog.locator('.diagram-canvas').press('0')
    await expect(scale).toHaveText(initialScale)
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(expand).toBeFocused()
    await expect(diagram.locator('.diagram-preview .diagram-svg svg')).toBeVisible()

    await page.getByRole('button', { name: 'Toggle Dark Mode', exact: true }).first().click()
    await expect(diagram).toHaveClass(/diagram-dark/)
    await expect(diagram).toHaveAttribute('aria-busy', 'false')
    await expect(diagram.locator('.diagram-svg svg')).toBeVisible()
    expect(errors).toEqual([])
  })
}

for (const colorScheme of ['light', 'dark'] as const) {
  test(`Mermaid controls fit a narrow touch viewport in ${colorScheme} mode`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 320, height: 740 },
      isMobile: true,
      hasTouch: true,
      colorScheme,
    })
    try {
      const page = await context.newPage()
      await page.goto('/examples/mermaid')
      const diagram = page.locator('.diagram-card').first()
      await expect(diagram).toHaveAttribute('aria-busy', 'false')
      if (colorScheme === 'dark')
        await expect(diagram).toHaveClass(/diagram-dark/)
      else
        await expect(diagram).not.toHaveClass(/diagram-dark/)

      const expand = diagram.locator('.diagram-expand')
      await expand.tap()
      const dialog = diagram.locator('dialog')
      await expect(dialog).toBeVisible()
      for (const button of await dialog.getByRole('button').all()) {
        const box = (await button.boundingBox())!
        expect(box.width).toBeGreaterThanOrEqual(44)
        expect(box.height).toBeGreaterThanOrEqual(44)
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(320)
      }

      const fit = dialog.getByRole('button', { name: 'Fit to window', exact: true })
      await fit.tap()
      await expect(dialog.locator('.diagram-svg svg')).toBeVisible()
      await page.setViewportSize({ width: 740, height: 320 })
      await expect(dialog).toHaveCSS('height', '320px')
      expect((await dialog.locator('.diagram-canvas').boundingBox())!.height).toBeGreaterThan(180)
      await dialog.getByRole('button', { name: 'Close diagram preview', exact: true }).tap()
      await expect(dialog).not.toBeVisible()
      await expect(expand).toBeFocused()
      expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
    }
    finally {
      await context.close()
    }
  })
}
