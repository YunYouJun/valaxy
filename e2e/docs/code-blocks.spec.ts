import { expect, test } from '@playwright/test'
import { env } from '../env'

test.use({
  baseURL: env.docs,
})

test.describe('code blocks should not contain [object Promise]', () => {
  const pages = [
    '/guide/getting-started',
    '/guide/commands/',
    '/guide/markdown',
  ]

  for (const pagePath of pages) {
    test(`page ${pagePath} code blocks render correctly`, async ({ page }) => {
      await page.goto(pagePath)

      // Wait for the main content to be rendered
      await page.waitForSelector('article', { state: 'visible' })

      // Check that no code block contains [object Promise]
      const codeBlocks = page.locator('pre code, div[class*="language-"]')
      const count = await codeBlocks.count()

      // Ensure there are actually code blocks on the page
      expect(count).toBeGreaterThan(0)

      for (let i = 0; i < count; i++) {
        const text = await codeBlocks.nth(i).textContent()
        expect(
          text,
          `Code block #${i + 1} on ${pagePath} contains [object Promise]`,
        ).not.toContain('[object Promise]')
      }

      // Also check the full page text as a catch-all
      const bodyText = await page.locator('article').textContent()
      expect(
        bodyText,
        `Page ${pagePath} contains [object Promise] in article content`,
      ).not.toContain('[object Promise]')
    })
  }
})
