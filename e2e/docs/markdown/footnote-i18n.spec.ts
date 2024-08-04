import { expect, test } from '@playwright/test'
import { env } from '../../env'

test.use({
  baseURL: env.docs,
})

test.describe('markdown footnote i18n', () => {
  test('en based visibility', async ({ page }) => {
    await page.goto('/guide/i18n')
    await page.evaluate(() => {
      document.documentElement.setAttribute('lang', 'en')
    })

    await expect(page.getByRole('paragraph').getByText('这是一个中文脚注')).not.toBeVisible()
    await expect(page.getByRole('paragraph').getByText('This is an English footnote')).toBeVisible()
    await expect(page.getByRole('paragraph').getByText('Public Link')).toBeVisible()
  })

  test('zh-cn based visibility', async ({ page }) => {
    await page.goto('/guide/i18n')
    await page.evaluate(() => {
      document.documentElement.setAttribute('lang', 'zh-CN')
    })

    await expect(page.getByRole('paragraph').getByText('这是一个中文脚注')).toBeVisible()
    await expect(page.getByRole('paragraph').getByText('This is an English footnote')).not.toBeVisible()
    await expect(page.getByRole('paragraph').getByText('Public Link')).toBeVisible()
  })
})
