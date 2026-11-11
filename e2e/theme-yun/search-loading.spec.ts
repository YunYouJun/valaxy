import { expect, test } from '@playwright/test'
import { setup, waitForHydration } from '../utils'

setup('theme-yun')

const searchScript = /\/YunFuseSearch\.[^/]+\.js$/

test('downloads Fuse only on first open and reuses the search state', async ({ page }) => {
  const scripts: string[] = []
  let indexRequests = 0
  page.on('request', request => searchScript.test(request.url()) && scripts.push(request.url()))
  await page.route('**/valaxy-fuse-list.json', (route) => {
    indexRequests++
    return route.fulfill({ json: [{ title: 'Lazy search fixture', link: '/posts/hello-valaxy', excerpt: 'Loaded on demand' }] })
  })
  await page.goto('/')
  await waitForHydration(page)
  await expect(page.locator('.yun-home-prologue-content')).toBeVisible()
  expect(scripts).toEqual([])
  expect(indexRequests).toBe(0)

  const trigger = page.locator('.yun-search-btn')
  await trigger.focus()
  await page.keyboard.press('Control+k')
  const dialog = page.getByRole('dialog')
  const input = dialog.getByRole('searchbox')
  await expect(input).toBeFocused()
  await input.fill('Lazy search')
  await expect(dialog.locator('.yun-search-result')).toHaveCount(1)
  expect(scripts.some(url => /\/YunFuseSearch\./.test(url))).toBe(true)
  const firstScripts = [...scripts]
  expect(indexRequests).toBe(1)

  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await expect(input).toBeFocused()
  await expect(input).toHaveValue('Lazy search')
  await expect(dialog.locator('.yun-search-result')).toHaveCount(1)
  expect(scripts).toEqual(firstScripts)
  expect(indexRequests).toBe(1)
})

test('closing while the dialog downloads does not reopen it or steal focus', async ({ page }) => {
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  let indexRequests = 0
  await page.route(/\/YunFuseSearch\.[^/]+\.js$/, async (route) => {
    await pending
    await route.continue()
  })
  await page.route('**/valaxy-fuse-list.json', (route) => {
    indexRequests++
    return route.fulfill({ json: [] })
  })
  try {
    await page.goto('/')
    await waitForHydration(page)
    await expect(page.locator('.yun-home-prologue-content')).toBeVisible()
    const trigger = page.locator('.yun-search-btn')
    await trigger.focus()
    const request = page.waitForRequest(/\/YunFuseSearch\.[^/]+\.js$/)
    await page.keyboard.press('Control+k')
    await request
    await page.keyboard.press('Control+k')
    const loaded = page.waitForResponse(/\/YunFuseSearch\.[^/]+\.js$/)
    release()
    await (await loaded).finished()
    // Allow the downloaded async component to mount with the latest closed prop.
    await page.waitForTimeout(300)
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(trigger).toBeFocused()
    expect(indexRequests).toBe(0)

    await page.keyboard.press('Control+k')
    await expect(page.getByRole('dialog').getByRole('searchbox')).toBeFocused()
    await expect.poll(() => indexRequests).toBe(1)
  }
  finally {
    release()
  }
})
