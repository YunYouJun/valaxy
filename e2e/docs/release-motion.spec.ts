import { expect, test } from '@playwright/test'

// No baseURL here: the dev and SSG Playwright configs each provide one.
test.use({ viewport: { width: 1440, height: 900 } })

test('types the Markdown intro, mirrors it in the preview and replays on demand', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/release/')
  const lines = page.locator('.hero-paper .md-line')
  await expect(lines).toHaveCount(9)
  await expect(lines.last()).toHaveText('<MyWorld />')
  await expect(lines.nth(4)).toHaveCSS('animation-delay', '1.79s')
  // `# Hello, world.` is line 4; the preview heading lands just after it.
  await expect(page.locator('.blog-body h2')).toHaveCSS('animation-delay', '2.04s')

  const stage = page.locator('.hero-stage')
  await expect(stage.locator('.hero-browser')).toHaveCSS('opacity', '1')
  const replay = page.getByRole('button', { name: 'Replay the intro' })
  await replay.click()
  // A fresh stage restarts its animations from the beginning.
  await expect.poll(() => stage.locator('.hero-version').evaluate(el =>
    Math.max(...el.getAnimations().map(a => Number(a.currentTime ?? 0))),
  )).toBeLessThan(1500)
  await expect(page.locator('.hero-paper .md-line')).toHaveCount(9)
})

test('runs the pipeline signal and galaxy only while they are on screen', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/release/')
  const pipeline = page.locator('.engine-pipeline')
  const galaxy = page.locator('.closing-galaxy')
  await expect(pipeline).not.toHaveClass(/is-playing/)
  await pipeline.scrollIntoViewIfNeeded()
  await expect(pipeline).toHaveClass(/is-playing/)
  await galaxy.scrollIntoViewIfNeeded()
  await expect(galaxy).toHaveClass(/is-playing/)
  await expect(galaxy.locator('.galaxy-star')).toHaveCount(96)
})

test('shows the finished composition without motion when reduced motion is preferred', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/zh/release/')
  for (const selector of ['.hero-version', '.hero-browser', '.hero-paper .md-line', '.blog-body h2'])
    await expect(page.locator(selector).first()).toHaveCSS('animation-name', 'none')
  await expect(page.locator('.blog-body h2')).toHaveCSS('opacity', '1')
  await expect(page.getByRole('button', { name: '重播开场动画' })).toBeHidden()
})
