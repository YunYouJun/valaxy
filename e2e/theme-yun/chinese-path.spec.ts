import { expect, test } from '@playwright/test'
import { env } from '../env'
import { setup } from '../utils'
import { waitForHydration } from '../utils/hydration'

setup('theme-yun')

// `pages/posts/中文Post测试.md` — vue-router/vite already percent-encodes the
// route path, so it must be reachable from its singly-encoded URL instead of
// falling into the `/[...path]` catch-all (404).
test('post with a Chinese file name renders in dev and build', async ({ page }) => {
  for (const [mode, baseURL] of [
    ['dev', env['theme-yun-dev']],
    ['build', env['theme-yun']],
  ] as const) {
    await test.step(mode, async () => {
      await page.goto(`${baseURL}/posts/${encodeURIComponent('中文Post测试')}`, { waitUntil: 'domcontentloaded' })
      await waitForHydration(page)

      await expect(page.locator('h1.post-title')).toHaveText('中文 Post 测试')
      await expect(page.locator('.markdown-body').first()).toContainText('中文测试')
      await expect(page.locator('.not-found')).toHaveCount(0)
    })
  }
})
