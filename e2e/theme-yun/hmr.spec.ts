import { rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import { env } from '../env'
import { waitForHydration } from '../utils/hydration'

test.use({
  baseURL: env['theme-yun-dev'],
})

// A temporary page, so that no other spec sees the edits (ignored by git)
const pageFile = fileURLToPath(new URL('../../demo/yun/pages/test/hmr-temp.md', import.meta.url))

function pageContent(title: string, body: string) {
  return `---
title: ${title}
comment: false
---

${body}
`
}

test.afterEach(async () => {
  await rm(pageFile, { force: true })
})

test('hot-updates an edited markdown page without reloading it', async ({ page }) => {
  await writeFile(pageFile, pageContent('HMR before', 'Paragraph before the edit.'))

  // The dev server needs a moment to pick up the new page
  await expect(async () => {
    await page.goto('/test/hmr-temp', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Paragraph before the edit.')).toBeVisible({ timeout: 2000 })
  }).toPass({ timeout: 30_000 })
  await waitForHydration(page)

  let loads = 0
  page.on('load', () => loads++)
  await page.evaluate(() => {
    (window as any).__hmrMarker = true
  })

  await writeFile(pageFile, pageContent('HMR after', 'Paragraph before the edit.\n\nParagraph after the edit.\n\n## HMR heading'))

  await expect(page.getByText('Paragraph after the edit.')).toBeVisible()
  await expect(page.locator('h1')).toContainText('HMR after')
  // route meta is updated by the `valaxy:pageData` handler
  await expect.poll(() => page.evaluate(() => {
    const router = (document.querySelector('#app') as any)?.__vue_app__?.config.globalProperties.$router
    const meta = router?.currentRoute.value.meta
    return {
      title: meta?.frontmatter?.title,
      headers: (meta?.headers || []).map((header: { title: string }) => header.title),
    }
  })).toEqual({ title: 'HMR after', headers: ['HMR heading'] })

  expect(loads).toBe(0)
  expect(await page.evaluate(() => (window as any).__hmrMarker)).toBe(true)
})
