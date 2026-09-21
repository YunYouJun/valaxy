import { expect, test } from '@playwright/test'

test('desktop language menu opens on hover and stays open while selecting a language', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/guide/getting-started')
  const translations = page.locator('.pr-nav-bar-translations')
  const trigger = translations.getByRole('button')
  const chinese = translations.getByRole('link', { name: '简体中文' })

  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.hover()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await chinese.hover()
  await expect(chinese).toBeVisible()
  await page.mouse.move(0, 400)
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('ArrowDown')
  await expect(chinese).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  await trigger.hover()
  await chinese.click()
  await expect(page).toHaveURL(/\/zh\/guide\/getting-started$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

test('mobile language menu still opens on tap', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/guide/getting-started')
  await page.getByRole('button', { name: /^(Open navigation|打开导航)$/ }).click()
  await page.locator('.press-locale-trigger:visible').click()
  await page.getByRole('menuitem', { name: '简体中文' }).click()
  await expect(page).toHaveURL(/\/zh\/guide\/getting-started$/)
})
