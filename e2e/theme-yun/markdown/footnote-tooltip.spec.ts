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

  const author = page.locator('.va-footnote[data-footnote-kind="author"]')
  await expect(author).toHaveCount(1)
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
    await staticPage.locator('.va-footnote[data-footnote-kind="author"] a').click()
    await expect(staticPage).toHaveURL(/#fn1$/)
    await expect(staticPage.locator('#fn1')).toContainText('那颗绿灯早点亮')
    await staticPage.locator('#fn1 .footnote-backref').click()
    await expect(staticPage).toHaveURL(/#fnref1$/)
  }
  finally {
    await context.close()
  }
})
