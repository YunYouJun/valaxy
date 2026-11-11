import { expect, test } from '@playwright/test'
import { setup, waitForHydration } from '../utils'

setup('theme-yun')

// The compiler's own dependency chunk is emitted separately from the lazy
// template component. Ordinary pages must not request either one.
const compilerAsset = /\/(?:compiler-dom\.esm-bundler|ValaxyRuntimeTemplate)\.[^/]+\.js$/

test('loads the compiler only after decryption and reuses it for repeated decrypts', async ({ page }) => {
  const requests: string[] = []
  const errors: string[] = []
  page.on('request', (request) => {
    if (compilerAsset.test(request.url()))
      requests.push(request.url())
  })
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await waitForHydration(page)
  await expect(page.locator('.yun-home-prologue-content')).toBeVisible()
  expect(requests).toEqual([])
  await page.goto('/posts/encrypted-post')
  await waitForHydration(page)
  expect(requests).toEqual([])
  const password = page.locator('.decrypt-password-container input')
  await password.fill('valaxy')
  await password.press('Enter')
  await expect(page.locator('.markdown-body')).toContainText('这里是被加密的复杂文章内容')
  await expect(page.locator('.markdown-body details')).toContainText('password_hint')
  expect(requests.some(url => url.includes('/compiler-dom.'))).toBe(true)
  const count = requests.length
  await page.getByRole('button', { name: 'Encrypt Again' }).click()
  await password.fill('valaxy')
  await password.press('Enter')
  await expect(page.locator('.markdown-body')).toContainText('这里是被加密的复杂文章内容')
  expect(requests).toHaveLength(count)
  expect(errors).toEqual([])
})

test('preserves SSR templates during delayed compiler hydration and handles template/data updates', async ({ page, request }) => {
  const html = await (await request.get('/test/dynamic-template')).text()
  expect(html).toContain('data-testid="compiled-message">Server-rendered excerpt</p>')
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route(compilerAsset, async (route) => {
    await gate
    await route.continue()
  })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (/hydration.*mismatch/i.test(message.text()))
      errors.push(message.text())
  })
  try {
    await page.goto('/test/dynamic-template', { waitUntil: 'domcontentloaded' })
    await expect(page.getByTestId('compiled-message')).toHaveText('Server-rendered excerpt')
  }
  finally { release() }
  await waitForHydration(page)
  const counter = page.getByTestId('compiled-counter')
  await expect(async () => {
    await counter.click()
    await expect(counter).not.toHaveText('Count: 0', { timeout: 1000 })
  }).toPass()
  await page.getByRole('button', { name: 'Update template data' }).click()
  await expect(page.getByTestId('compiled-message')).toHaveText('Updated template data')
  await page.getByRole('button', { name: 'Replace template' }).click()
  await expect(page.locator('strong[data-testid="compiled-message"]')).toHaveText('Updated template data!')
  await page.getByRole('button', { name: 'Clear template' }).click()
  await expect(page.getByTestId('compiled-message')).toHaveCount(0)
  expect(errors).toEqual([])
})
