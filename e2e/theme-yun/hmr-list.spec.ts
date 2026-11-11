import { rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import { env } from '../env'
import { waitForHydration } from '../utils/hydration'

test.use({ baseURL: env['theme-yun-dev'] })

const pageFile = fileURLToPath(new URL('../../demo/yun/pages/posts/hmr-list-temp.md', import.meta.url))
const postPath = '/posts/hmr-list-temp'

function postContent(title: string, excerpt: string, metadata = '') {
  return `---
title: ${title}
date: 2026-11-11
top: 1000
comment: false
katex: true
${metadata}
---

${excerpt}

<!-- more -->

Article body outside the excerpt.
`
}

test('updates an unvisited post in lists without reloading, including removed metadata and files', async ({ page }) => {
  await writeFile(pageFile, postContent('List HMR before', 'Excerpt before.', 'tags: [hmr-before]\ncategories: [hmr-category]'), { flag: 'wx' })
  try {
    const card = page.locator('.post-card-wrapper').filter({ has: page.locator(`.post-title-link[href="${postPath}"]`) })
    await expect(async () => {
      await page.goto('/')
      await expect(card).toContainText('Excerpt before.', { timeout: 2000 })
    }).toPass({ timeout: 30_000 })
    await waitForHydration(page)
    let loads = 0
    page.on('load', () => loads++)
    await page.evaluate(() => {
      (window as any).__hmrListMarker = true
    })
    async function expectNoReload() {
      expect(loads).toBe(0)
      expect(await page.evaluate(() => (window as any).__hmrListMarker)).toBe(true)
    }

    await writeFile(pageFile, postContent('List HMR after', 'Excerpt after. $x^2$', 'tags: [hmr-after]'))
    await expect(card.locator('.post-title-link')).toHaveText('List HMR after')
    await expect(card).toContainText('Excerpt after.')
    await expect(card.locator('.katex')).toBeVisible()
    await expect(card).toContainText('hmr-after')
    await expect(card).not.toContainText('hmr-before')
    await expect(card).not.toContainText('hmr-category')
    await expectNoReload()

    await writeFile(pageFile, postContent('Manual excerpt', 'Unused summary.', 'excerpt: Manual HMR summary'))
    await expect(card).toContainText('Manual HMR summary')
    await expect(card).not.toContainText('hmr-after')
    await expect(card.locator('.katex')).toHaveCount(0)
    await expectNoReload()

    await writeFile(pageFile, postContent('HTML excerpt', '<span>Dynamic HMR {{ 1 + 1 }}</span>', 'excerpt_type: html'))
    await expect(card).toContainText('Dynamic HMR 2')
    await expectNoReload()
    await writeFile(pageFile, postContent('HTML excerpt', '<strong>Dynamic HMR {{ 2 + 2 }}</strong>', 'excerpt_type: html'))
    await expect(card.locator('strong')).toHaveText('Dynamic HMR 4')
    await expectNoReload()

    await rm(pageFile)
    await expect(card).toHaveCount(0)
    await expectNoReload()
    await writeFile(pageFile, postContent('Recreated post', 'Fresh excerpt.'))
    await expect(card).toContainText('Fresh excerpt.')
    await expectNoReload()
  }
  finally {
    // Finish the browser session before removing the recreated fixture so
    // teardown cannot race any in-flight route-module requests.
    await page.close()
    await rm(pageFile, { force: true })
  }
})
