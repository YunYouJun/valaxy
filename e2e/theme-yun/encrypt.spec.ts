import { expect, test } from '@playwright/test'
import { setup } from '../utils'

setup('theme-yun')

test.describe('Encrypted Post', () => {
  test('encrypted post', async ({ page }) => {
    await page.goto('/posts/encrypted-post', { waitUntil: 'domcontentloaded' })

    await page.waitForSelector('.markdown-body')
    await expect(page.locator('.decrypt-password-container')).toHaveCount(1)

    await page.fill('.decrypt-password-container input', 'valaxy')
    await page.press('.decrypt-password-container input', 'Enter')

    await expect(page.locator('p')).toContainText(['这里是被加密的复杂文章内容'])
  })

  test('encrypt-again actions have mobile bottom spacing', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })

    for (const { path, password } of [
      { path: '/posts/encrypted-post', password: 'valaxy' },
      { path: '/albums/sunset', password: 'test' },
    ]) {
      await page.goto(path, { waitUntil: 'domcontentloaded' })

      const passwordInput = page.locator('.decrypt-password-container input')
      await passwordInput.fill(password)
      await passwordInput.press('Enter')

      const encryptAgainAction = page.locator('.decrypt-action')
      await expect(encryptAgainAction).toHaveCSS('margin-bottom', '32px')

      await page.getByRole('button', { name: 'Encrypt Again' }).click()
      await expect(passwordInput).toBeVisible()
    }
  })
})
