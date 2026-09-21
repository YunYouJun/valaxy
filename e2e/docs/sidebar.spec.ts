import { expect, test } from '@playwright/test'

test('uses the same selected row for generated categories and explicit sidebar links', async ({ page }) => {
  const styles = []
  for (const path of ['/guide/commands', '/api/node/functions/defineSiteConfig']) {
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
    await expect(active).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(active.locator('.text')).toHaveCSS('font-weight', '500')
    styles.push(await active.evaluate((element) => {
      const style = getComputedStyle(element)
      return { background: style.backgroundColor, color: style.color, padding: style.padding }
    }))
  }
  expect(styles[0]).toEqual(styles[1])
})
