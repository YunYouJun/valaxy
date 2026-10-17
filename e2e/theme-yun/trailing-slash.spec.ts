import { expect, test } from '@playwright/test'
import { env } from '../env'
import { setup } from '../utils'
import { waitForHydration } from '../utils/hydration'

setup('theme-yun')

// theme-yun's 404 layout does not render <RouterView />, so the catch-all page
// never mounts there. Trailing-slash post URLs must still resolve to the post
// through vue-router's non-strict matching instead of falling into the 404 layout.
test('post url with trailing slash renders the post in dev and build', async ({ page }) => {
  for (const [mode, baseURL] of [
    ['dev', env['theme-yun-dev']],
    ['build', env['theme-yun']],
  ] as const) {
    await test.step(mode, async () => {
      await page.goto(`${baseURL}/posts/hello-valaxy/`, { waitUntil: 'domcontentloaded' })
      await waitForHydration(page)

      await expect(page.locator('h1.post-title')).toHaveText('Hello, Valaxy!')
      await expect(page.locator('.markdown-body').first()).toBeVisible()
      await expect(page.locator('.not-found')).toHaveCount(0)
    })
  }
})
