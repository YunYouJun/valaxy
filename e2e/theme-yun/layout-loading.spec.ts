import { expect, test } from '@playwright/test'
import { setup, waitForHydration } from '../utils'

setup('theme-yun')

const postLayoutScript = /\/post\.[^/]+\.js$/

test('keeps the server-rendered article intact while its layout downloads', async ({ page }) => {
  let release!: () => void
  const ready = new Promise<void>((resolve) => {
    release = resolve
  })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (/hydration|mismatch/i.test(message.text()))
      errors.push(message.text())
  })
  await page.route(postLayoutScript, async (route) => {
    await ready
    await route.continue()
  })
  try {
    const requested = page.waitForRequest(postLayoutScript)
    await page.goto('/posts/hello-valaxy', { waitUntil: 'commit' })
    await requested
    const header = page.locator('.post-header')
    await expect(header).toBeVisible()
    await expect(header).toContainText('Hello, Valaxy!')
    const original = await header.elementHandle()
    expect(await page.locator('#app').evaluate(el => '__vue_app__' in el)).toBe(false)
    release()
    await waitForHydration(page)
    expect(await original!.evaluate(el => el === document.querySelector('.post-header'))).toBe(true)
    expect(errors).toEqual([])
  }
  finally { release() }
})

test('loads the post layout on navigation and reuses it after going back', async ({ page }) => {
  const requests: string[] = []
  const errors: string[] = []
  let documentLoads = 0
  page.on('load', () => documentLoads++)
  page.on('request', (request) => {
    if (postLayoutScript.test(request.url()))
      requests.push(request.url())
  })
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (/hydration|mismatch/i.test(message.text()))
      errors.push(message.text())
  })
  await page.goto('/')
  await waitForHydration(page)
  await expect(page.locator('.yun-home-prologue-content')).toBeVisible()
  expect(requests).toEqual([])
  const initialLoads = documentLoads
  for (let i = 0; i < 2; i++) {
    await page.locator('.post-title-link[href="/posts/hello-valaxy"]').first().click()
    await expect(page.locator('.post-header')).toContainText('Hello, Valaxy!')
    expect(requests).toHaveLength(1)
    await page.goBack()
    await expect(page.locator('.yun-home-prologue-content')).toBeVisible()
    await expect(page.locator('.post-title-link').first()).toBeVisible()
  }
  expect(documentLoads).toBe(initialLoads)
  expect(errors).toEqual([])
})
