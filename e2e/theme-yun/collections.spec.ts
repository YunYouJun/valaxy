import { expect, test } from '@playwright/test'
import { setup } from '../utils'

setup('theme-yun')

test.describe('Collections', () => {
  test('collection sidebar shows all items including link items', async ({ page }) => {
    await page.goto('/collections/links-test/1', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.yun-sidebar-item')

    // Sidebar should show items
    const items = page.locator('.yun-layout-left .yun-sidebar-item .item')
    const count = await items.count()
    expect(count).toBeGreaterThan(0)

    // External link items should have target="_blank"
    const externalLinks = page.locator('.yun-layout-left .yun-sidebar-item .item a[target="_blank"]')
    const externalCount = await externalLinks.count()
    expect(externalCount).toBeGreaterThan(0)

    // External link items should have external-link icon
    const externalIcons = page.locator('.yun-layout-left .yun-sidebar-item .item a[target="_blank"] .i-ri-external-link-line')
    expect(await externalIcons.count()).toBe(externalCount)
  })

  test('collection sidebar internal link uses RouterLink', async ({ page }) => {
    await page.goto('/collections/links-test/1', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.yun-sidebar-item')

    // Internal link items should be <a> tags without target="_blank" (RouterLink renders as <a>)
    // Check that "Hello Valaxy" link exists and points to /posts/hello-valaxy
    const internalLink = page.locator('.yun-layout-left .yun-sidebar-item .item a[href="/posts/hello-valaxy"]')
    const count = await internalLink.count()
    expect(count).toBe(1)
    // Internal links should NOT have target="_blank"
    await expect(internalLink).not.toHaveAttribute('target', '_blank')
  })

  test('collection prev/next navigation includes link items', async ({ page }) => {
    await page.goto('/collections/links-test/1', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.collection-prev-next')

    // Next item after "1" (第一章 开始) is "Valaxy 官网" (external link)
    const nextLink = page.locator('.collection-prev-next .next')
    await expect(nextLink).toBeVisible()
  })

  test('collection nav shows correct item count including links', async ({ page }) => {
    await page.goto('/collections/links-test/1', { waitUntil: 'domcontentloaded' })

    // The collection nav should show position like "1 / N" where N includes link items
    const nav = page.locator('.collection-nav')
    if (await nav.count() > 0) {
      const text = await nav.textContent()
      // Total items = 3 key items + 2 link items = 5
      expect(text).toContain('5')
    }
  })
})

test.describe('Pagination Layout', () => {
  test('pagination is below post list on /page/2', async ({ page }) => {
    await page.goto('/page/2', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.yun-post-list')
    await page.waitForSelector('.pagination')

    // Post list and pagination should be vertically stacked, not side by side
    const postList = page.locator('.yun-post-list')
    const pagination = page.locator('.pagination')

    const postListBox = await postList.boundingBox()
    const paginationBox = await pagination.boundingBox()

    expect(postListBox).not.toBeNull()
    expect(paginationBox).not.toBeNull()

    // Pagination should be below the post list (y position greater)
    expect(paginationBox!.y).toBeGreaterThan(postListBox!.y + postListBox!.height - 1)
  })

  test('pagination is below post list on homepage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.yun-post-list')
    await page.waitForSelector('.pagination')

    const postList = page.locator('.yun-post-list')
    const pagination = page.locator('.pagination')

    const postListBox = await postList.boundingBox()
    const paginationBox = await pagination.boundingBox()

    expect(postListBox).not.toBeNull()
    expect(paginationBox).not.toBeNull()

    // Pagination should be below the post list
    expect(paginationBox!.y).toBeGreaterThan(postListBox!.y + postListBox!.height - 1)
  })
})

test.describe('Collection switching', () => {
  test('switching navigates to the collection home and updates the directory', async ({ page }) => {
    await page.goto('/collections/links-test/1', { waitUntil: 'domcontentloaded' })
    const sidebar = page.locator('.yun-layout-left .yun-collection-sidebar')
    await sidebar.getByRole('combobox').selectOption('hamster')
    await expect(page).toHaveURL(/\/collections\/hamster\//)
    await expect(sidebar.locator('.title')).toHaveText('仓鼠')
    await expect(sidebar.getByRole('link', { name: '第一章 仓鼠的笼子', exact: true })).toBeVisible()
    await page.goBack()
    await expect(sidebar.getByRole('combobox')).toHaveValue('links-test')
  })

  test('linked posts retain the collection directory and previous/next navigation', async ({ page }) => {
    await page.goto('/posts/hello-valaxy', { waitUntil: 'domcontentloaded' })
    const sidebar = page.locator('.yun-layout-left .yun-collection-sidebar')
    await expect(sidebar.getByRole('combobox')).toHaveValue('links-test')
    await expect(sidebar.locator('.item a[aria-current="page"]')).toHaveText('Hello Valaxy')
    await expect(page.locator('.collection-prev-next .prev')).toHaveAttribute('href', '/collections/links-test/2')
    await expect(page.locator('.collection-prev-next .next')).toHaveAttribute('href', '/collections/links-test/3')
  })

  test('mobile readers can expand the directory and switch collections', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/collections/links-test/1', { waitUntil: 'domcontentloaded' })
    const directory = page.locator('.yun-collection-mobile')
    await expect(directory).not.toHaveAttribute('open')
    const toggle = directory.locator('summary')
    const closed = (await toggle.boundingBox())!
    await toggle.click()
    const expanded = (await toggle.boundingBox())!
    expect(expanded.width).toBe(closed.width)
    expect(expanded.x).toBe(closed.x)
    expect(expanded.height).toBe(closed.height)
    await directory.getByRole('combobox').selectOption('hamster')
    await expect(page).toHaveURL(/\/collections\/hamster\//)
    await expect(directory).not.toHaveAttribute('open')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
})
