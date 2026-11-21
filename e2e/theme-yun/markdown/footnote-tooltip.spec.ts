import { expect, test } from '@playwright/test'
import { setup, waitForHydration } from '../../utils'
import { testFootnotePreviews } from '../../utils/footnotes'

setup('theme-yun')

testFootnotePreviews('/test/footnotes')

test('mounts comments after article hydration without losing the script', async ({ page }) => {
  const warnings: string[] = []
  page.on('console', (message) => {
    if (['warning', 'error'].includes(message.type()) && /hydration/i.test(message.text()))
      warnings.push(message.text())
  })
  page.on('pageerror', error => warnings.push(error.message))
  // Keep the third-party network deterministic while exercising the real mount timing.
  await page.route('https://utteranc.es/client.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: 'document.currentScript.dataset.loaded = "true"',
  }))
  await page.reload({ waitUntil: 'domcontentloaded' })
  const commentScript = page.locator('.yun-comment script[src="https://utteranc.es/client.js"]')
  await expect(commentScript).toHaveAttribute('data-loaded', 'true')
  await page.locator('.va-footnote-preview').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(commentScript).toHaveCount(1)
  expect(warnings).toEqual([])
})

test('previews a Markdown author note alongside an ordinary footnote', async ({ page, browser, isMobile }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/test/author-notes', { waitUntil: 'domcontentloaded' })
  await waitForHydration(page)

  const authorNotes = page.locator('.va-footnote[data-footnote-kind="author"]')
  await expect(authorNotes).toHaveCount(2)
  const hide = page.getByRole('button', { name: '隐藏作者旁注', exact: true })
  if (!isMobile && (page.viewportSize()?.width ?? 0) >= 1280)
    await hide.click()
  const author = authorNotes.filter({ has: page.locator('a[href="#fn1"]') })
  const reference = author.getByRole('link')
  const trigger = author.getByRole('button', { name: '预览作者旁注' })
  if (isMobile) {
    await trigger.tap()
  }
  else {
    await reference.hover()
  }

  const popover = page.getByRole('dialog', { name: '作者旁注' })
  await expect(popover).toHaveAttribute('data-footnote-kind', 'author')
  await expect(popover.getByText('作者旁注', { exact: true })).toBeVisible()
  await expect(popover.locator('strong')).toHaveText('多年后补记。')
  await expect(popover.locator('code')).toHaveText('Travis CI')
  await expect(popover.locator('p')).toHaveCount(2)
  await expect(popover.getByRole('link', { name: 'Valaxy' })).toHaveAttribute('href', 'https://valaxy.site/zh/guide/why')
  await popover.getByRole('button', { name: '关闭脚注预览' }).click()
  await expect(popover).toHaveCount(0)

  await page.getByRole('button', { name: '预览脚注', exact: true }).click()
  const ordinary = page.getByRole('dialog')
  await expect(ordinary).toContainText('当时的 CI 配置文件')
  await expect(ordinary).not.toHaveAttribute('data-footnote-kind', 'author')
  expect(errors).toEqual([])

  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const staticPage = await context.newPage()
    await staticPage.goto(page.url(), { waitUntil: 'domcontentloaded' })
    await staticPage.locator('.va-footnote[data-footnote-kind="author"] a[href="#fn1"]').click()
    await expect(staticPage).toHaveURL(/#fn1$/)
    await expect(staticPage.locator('#fn1')).toContainText('那颗绿灯早点亮')
    await staticPage.locator('#fn1 .footnote-backref').click()
    await expect(staticPage).toHaveURL(/#fnref1$/)
  }
  finally {
    await context.close()
  }
})

test('aligns wide author notes to their source, avoids collisions and remembers the toolbar toggle', async ({ page, isMobile }) => {
  test.skip(isMobile, 'The reading rail requires a wide viewport')
  await page.setViewportSize({ width: 1560, height: 720 })
  await page.goto('/test/author-notes', { waitUntil: 'domcontentloaded' })
  await waitForHydration(page)

  const rail = page.getByRole('complementary', { name: '作者旁注', exact: true })
  const hide = page.getByRole('button', { name: '隐藏作者旁注', exact: true })
  const first = rail.getByRole('region', { name: '作者旁注 [1]', exact: true })
  const second = rail.getByRole('region', { name: '作者旁注 [2]', exact: true })
  const source = (id: string) => page.locator(`article .footnote-ref a[href="#${id}"]`)
  const alignment = () => page.evaluate(() => ['fn1', 'fn2'].map((id) => {
    const source = document.querySelector(`article .footnote-ref a[href="#${id}"]`)
    const card = document.querySelector(`.yun-author-note-card[data-note-id="${id}"]`)
    return Math.round(card!.getBoundingClientRect().top - source!.getBoundingClientRect().top)
  }))

  await expect(rail.getByRole('region')).toHaveCount(2)
  await expect(first.locator('strong')).toHaveText('多年后补记。')
  await expect(first.getByRole('link', { name: 'Valaxy' })).toHaveAttribute('href', 'https://valaxy.site/zh/guide/why')
  await expect(hide).toHaveClass(/yun-action-btn/)
  const matchesToken = await hide.evaluate((button) => {
    const styles = getComputedStyle(button)
    const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
    return Math.abs(Number.parseFloat(styles.width) - Number.parseFloat(styles.getPropertyValue('--yun-action-btn-size')) * rem) < 1
  })
  expect(matchesToken).toBe(true)
  await expect.poll(alignment).toEqual([0, 0])
  await source('fn1').hover()
  await expect(page.getByRole('dialog', { name: '作者旁注' })).toHaveCount(0)

  await page.evaluate(() => window.scrollTo(0, 250))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  await expect.poll(alignment).toEqual([0, 0])
  await page.setViewportSize({ width: 1320, height: 720 })
  await expect.poll(alignment).toEqual([0, 0])

  await source('fn2').click()
  await expect(second).toBeFocused()
  await expect(page).not.toHaveURL(/#fn2$/)
  await second.getByRole('link', { name: '跳回正文旁注 [2]', exact: true }).click()
  await expect(source('fn2')).toBeFocused()

  await page.evaluate(() => {
    const first = document.querySelector('article a[href="#fn1"]')!.closest('.va-footnote')!
    const second = document.querySelector('article a[href="#fn2"]')!.closest('.va-footnote')!
    first.after(second)
    first.closest('article')!.dispatchEvent(new Event('toggle'))
  })
  await expect.poll(async () => {
    const one = (await first.boundingBox())!
    const two = (await second.boundingBox())!
    return Math.round(two.y - one.y - one.height)
  }).toBe(12)

  await hide.click()
  const show = page.getByRole('button', { name: '显示作者旁注', exact: true })
  await expect(rail).toHaveCount(0)
  await expect(show).toHaveAttribute('aria-pressed', 'false')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await waitForHydration(page)
  await expect(show).toBeVisible()
  await expect(rail).toHaveCount(0)
  await source('fn1').hover()
  await expect(page.getByRole('dialog', { name: '作者旁注' })).toContainText('那颗绿灯早点亮')
  await page.keyboard.press('Escape')
  await show.click()
  await expect(rail.getByRole('region')).toHaveCount(2)

  await page.setViewportSize({ width: 960, height: 720 })
  await expect(rail).toHaveCount(0)
  await expect(hide).toHaveCount(0)
  await page.getByRole('button', { name: '预览作者旁注', exact: true }).first().click()
  await expect(page.getByRole('dialog', { name: '作者旁注' })).toContainText('那颗绿灯早点亮')
})
