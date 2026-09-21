import { expect, test } from '@playwright/test'

test('uses the same text highlight for generated categories and explicit sidebar links', async ({ page }) => {
  const styles = []
  for (const path of ['/guide/getting-started', '/guide/commands', '/api/node/', '/api/node/functions/defineSiteConfig']) {
    await page.goto(path)
    await expect.poll(() => page.locator('#app').evaluate(el => !!(el as HTMLElement & { __vue_app__?: unknown }).__vue_app__)).toBe(true)
    const menu = page.locator('.press-local-nav .menu')
    if (await menu.isVisible())
      await menu.click()

    const active = page.locator('.press-sidebar-link.is-active')
    await expect(active).toHaveCount(1)
    await expect(active).toBeVisible()
    await expect(active).toHaveAttribute('aria-current', 'page')
    await expect(active).toHaveCSS('border-radius', '6px')
    await expect(active).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(active.locator('.text')).toHaveCSS('font-weight', '500')
    styles.push(await active.evaluate((element) => {
      const style = getComputedStyle(element)
      return { background: style.backgroundColor, color: style.color, padding: style.padding }
    }))
  }
  for (const style of styles)
    expect(style).toEqual(styles[0])
})

for (const viewport of [{ width: 1440, height: 1080 }, { width: 390, height: 844 }]) {
  test.describe(`sidebar groups at ${viewport.width}px`, () => {
    test.use({ viewport, reducedMotion: 'reduce' })

    test('toggles generated and explicit groups with the title and keyboard', async ({ page }) => {
      await page.goto('/guide/commands')
      await expect.poll(() => page.locator('#app').evaluate(el => !!(el as HTMLElement & { __vue_app__?: unknown }).__vue_app__)).toBe(true)
      const menu = page.locator('.press-local-nav .menu')
      if (await menu.isVisible())
        await menu.click()

      const sidebar = page.getByRole('navigation', { name: 'Sidebar Navigation' })
      for (const [name, child] of [['Getting Started', 'Why Valaxy'], ['Guide', 'Layout']]) {
        const toggle = sidebar.getByRole('button', { name, exact: true })
        const link = sidebar.getByRole('link', { name: child, exact: true })
        await expect(toggle).toHaveAttribute('aria-expanded', 'true')
        await toggle.getByText(name, { exact: true }).click()
        await expect(toggle).toHaveAttribute('aria-expanded', 'false')
        await expect(link).toHaveCount(0)
        await expect(page).toHaveURL(/\/guide\/commands$/)

        await toggle.press('Space')
        await expect(toggle).toHaveAttribute('aria-expanded', 'true')
        await expect(link).toBeVisible()
        await toggle.press('Enter')
        await expect(link).toHaveCount(0)
        await toggle.press('Enter')
        await expect(link).toBeVisible()
      }

      await expect(sidebar.getByRole('link', { name: 'Commands', exact: true })).toHaveAttribute('aria-current', 'page')
    })

    test('keeps linked group navigation separate from its collapse button', async ({ page }) => {
      await page.goto('/api/node/functions/defineSiteConfig')
      await expect.poll(() => page.locator('#app').evaluate(el => !!(el as HTMLElement & { __vue_app__?: unknown }).__vue_app__)).toBe(true)
      const menu = page.locator('.press-local-nav .menu')
      if (await menu.isVisible())
        await menu.click()

      const sidebar = page.getByRole('navigation', { name: 'Sidebar Navigation' })
      const toggle = sidebar.getByRole('button', { name: 'node', exact: true })
      const child = sidebar.getByRole('link', { name: 'defineSiteConfig', exact: true })
      await toggle.click()
      await expect(toggle).toHaveAttribute('aria-expanded', 'false')
      await expect(child).toHaveCount(0)
      await expect(page).toHaveURL(/\/api\/node\/functions\/defineSiteConfig$/)
      await toggle.click()
      await expect(toggle).toHaveAttribute('aria-expanded', 'true')
      await expect(child).toBeVisible()

      const link = sidebar.getByRole('link', { name: 'node', exact: true })
      await link.click()
      await expect(page).toHaveURL(/\/api\/node\/?$/)
      if (viewport.width < 960) {
        await expect(page.locator('.press-sidebar')).not.toHaveClass(/open/)
        await menu.click()
      }
      await expect(link).toHaveAttribute('aria-current', 'page')
    })
  })
}
