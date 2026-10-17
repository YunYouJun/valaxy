import { expect, test } from '@playwright/test'
import { env } from '../env'

test.use({ baseURL: env['theme-yun-dev'] })

const missingPath = '/missing/page?from=e2e'

test('pre-fills the missing path in the 404 report link', async ({ page }) => {
  await page.goto(missingPath)

  await expect(page.locator('.yun-404-title')).toHaveText('页面不存在')
  await expect(page.locator('.yun-404-path')).toHaveText(missingPath)

  const report = page.locator('.yun-404-report')
  await expect(report).toContainText('链接失效了？反馈一下')
  const href = await report.getAttribute('href')
  const url = new URL(href!)
  expect(`${url.origin}${url.pathname}`).toBe('https://github.com/YunYouJun/valaxy/issues/new')
  expect(url.searchParams.get('title')).toBe(`404: ${missingPath}`)
  expect(url.searchParams.get('body')).toContain(missingPath)
})

test('shows the 404 content immediately with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(missingPath)

  const chars = page.locator('.yun-404-char')
  await expect(chars).toHaveCount(3)
  for (const target of [chars.first(), chars.last(), page.locator('.yun-404-title'), page.locator('.yun-404-actions')]) {
    expect(await target.evaluate(el => getComputedStyle(el).opacity)).toBe('1')
  }
  expect(await page.locator('.yun-404-line.top').evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThan(0)

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})
