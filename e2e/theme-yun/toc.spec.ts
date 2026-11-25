import { expect, test } from '@playwright/test'
import { setup } from '../utils'
import { waitForHydration } from '../utils/hydration'

setup('theme-yun')

test.describe('TOC', () => {
  test('toc generate', async ({ page }) => {
    await page.goto('/posts/hello-valaxy')

    await expect(page.locator('.yun-aside')).toHaveCount(1)
    await expect(page.locator('.yun-aside .va-toc-item')).toHaveText([
      '什么是 Valaxy?',
      'A Vue component in your post',
    ])

    const vaTocItem = page.locator('.yun-aside .va-toc-item').nth(0)
    await expect(vaTocItem).toHaveAttribute('lang', 'zh-CN')
    await expect(vaTocItem).toHaveText('什么是 Valaxy?')
  })

  test('toc is visible on desktop viewport', async ({ page }) => {
    // Desktop Chrome viewport is 1280x720 (xl breakpoint)
    // At xl (1280px+), .yun-aside uses CSS media query to switch to
    // position: sticky with width: 320px, making the TOC visible.
    await page.goto('/posts/hello-valaxy')
    await page.waitForSelector('.markdown-body')

    const aside = page.locator('.yun-aside')
    await expect(aside).toBeVisible()

    // TOC items populate after hydration via onContentUpdated().
    // CSS i18n hides items whose lang doesn't match the page locale (zh-CN),
    // so target a visible outline link rather than .first().
    const tocLink = page.locator('.yun-aside .va-toc-item .outline-link').locator('visible=true').first()
    await expect(tocLink).toBeVisible()
  })

  test('mobile outline drawer aligns close button and keeps focus ring inside header', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/posts/hello-valaxy', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    const trigger = page.locator('.yun-local-outline-trigger')
    await expect(trigger).toBeVisible()
    await trigger.hover()
    await expect(trigger).not.toHaveCSS('background-color', 'rgba(0, 120, 231, 0.06)')
    await expect(trigger).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await trigger.focus()
    await page.keyboard.press('Enter')

    const aside = page.locator('#yun-page-outline')
    const header = aside.locator('.yun-aside-mobile-header')
    const closeBtn = aside.locator('.yun-aside-close')
    await expect(aside).toHaveClass(/\bopen\b/)
    await expect(aside).toBeVisible()
    await expect(header).toBeVisible()
    await expect(closeBtn).toBeFocused()
    await expect(closeBtn).toHaveCSS('border-radius', '10px')
    await expect(closeBtn).toHaveCSS('outline-style', 'solid')
    await expect(closeBtn).toHaveCSS('outline-offset', '1px')

    const icon = closeBtn.locator('span')
    await expect(icon).toHaveCSS('width', '20px')
    await expect(icon).toHaveCSS('height', '20px')

    const headerBox = await header.boundingBox()
    const closeBox = await closeBtn.boundingBox()
    expect(headerBox).not.toBeNull()
    expect(closeBox).not.toBeNull()
    expect(closeBox!.y - 3).toBeGreaterThanOrEqual(headerBox!.y)
    expect(closeBox!.y + closeBox!.height + 3).toBeLessThanOrEqual(headerBox!.y + headerBox!.height)

    await closeBtn.click()
    await expect(aside).not.toHaveClass(/open/)
    await expect(trigger).toBeFocused()
  })

  test('local outline nav syncs glass surface, card spacing, sticky sidebar clearance, and mobile flush edge', async ({ page }) => {
    await page.route(/fonts\.(googleapis|loli)\.com/, route => route.fulfill({ contentType: 'text/css', body: '' }))

    const localNav = page.locator('.yun-local-outline-nav')
    const mainCard = page.locator('.yun-main .yun-card').first()
    const leftSidebar = page.locator('.yun-layout-left')

    // Tablet / narrow desktop (820px): glass sync, 40px height, 1rem gap above rounded card
    await page.setViewportSize({ width: 820, height: 800 })
    await page.goto('/posts/hello-valaxy', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    await expect(localNav).toBeVisible()
    await expect(localNav).toHaveCSS('backdrop-filter', /blur\(12px\)/)
    const navBox820 = await localNav.boundingBox()
    const cardBox820 = await mainCard.boundingBox()
    expect(navBox820).not.toBeNull()
    expect(cardBox820).not.toBeNull()
    expect(navBox820!.height).toBeCloseTo(40, 0)
    await expect(mainCard).toHaveCSS('border-top-left-radius', '8px')
    const gap820 = cardBox820!.y - (navBox820!.y + navBox820!.height)
    expect(gap820).toBeGreaterThanOrEqual(15)
    expect(gap820).toBeLessThanOrEqual(18)

    // lg breakpoint (1120px): both main card and sticky left sidebar clear local nav before & after scroll
    await page.setViewportSize({ width: 1120, height: 800 })
    await expect(localNav).toBeVisible()
    await expect(leftSidebar).toBeVisible()
    const navBox1120 = await localNav.boundingBox()
    const cardBox1120 = await mainCard.boundingBox()
    const sidebarBoxBefore = await leftSidebar.boundingBox()
    expect(navBox1120).not.toBeNull()
    expect(cardBox1120).not.toBeNull()
    expect(sidebarBoxBefore).not.toBeNull()
    expect(cardBox1120!.y - (navBox1120!.y + navBox1120!.height)).toBeGreaterThanOrEqual(15)
    expect(sidebarBoxBefore!.y - (navBox1120!.y + navBox1120!.height)).toBeGreaterThanOrEqual(15)

    await page.evaluate(() => window.scrollTo(0, 400))
    await expect.poll(async () => {
      const navBox = await localNav.boundingBox()
      const sidebarBox = await leftSidebar.boundingBox()
      return sidebarBox!.y - (navBox!.y + navBox!.height)
    }).toBeGreaterThanOrEqual(14)

    // Mobile dark mode (390px): full-bleed card sits flush with no doubled top border
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/posts/hello-valaxy', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
    const navBoxMobile = await localNav.boundingBox()
    const cardBoxMobile = await mainCard.boundingBox()
    expect(navBoxMobile).not.toBeNull()
    expect(cardBoxMobile).not.toBeNull()
    expect(Math.abs(cardBoxMobile!.y - (navBoxMobile!.y + navBoxMobile!.height))).toBeLessThanOrEqual(1)
    await expect(mainCard).toHaveCSS('border-top-left-radius', '0px')
    await expect(mainCard).toHaveCSS('border-top-width', '0px')
  })
})
