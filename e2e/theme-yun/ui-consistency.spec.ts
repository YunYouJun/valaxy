import { expect, test } from '@playwright/test'
import { setup, waitForHydration } from '../utils'

setup('theme-yun')

test.describe('Theme Yun UI consistency', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`albums cards, gallery back button, sponsor cards, post actions, post nav, archive sort, and notice render consistently in ${colorScheme} mode`, async ({ page }) => {
      await page.route(/fonts\.(googleapis|loli)\.com/, route => route.fulfill({ contentType: 'text/css', body: '' }))
      await page.route('https://v1.hitokoto.cn/**', route => route.fulfill({
        json: { hitokoto: 'A stable quote for UI consistency.', from_who: 'Valaxy', from: 'E2E' },
      }))

      await page.setViewportSize({ width: 1280, height: 800 })
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })

      // 1. Notice banner on home page
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      await waitForHydration(page)
      const notice = page.locator('.yun-notice')
      await expect(notice).toBeVisible()
      await expect(notice).toHaveCSS('border-radius', '8px')
      await expect(notice).not.toHaveCSS('background-color', 'rgba(200, 200, 200, 0.1)')

      // 2. Albums page (/albums)
      await page.goto('/albums', { waitUntil: 'domcontentloaded' })
      await waitForHydration(page)

      const albumCards = page.locator('.yun-album-card')
      const cardCount = await albumCards.count()
      expect(cardCount).toBeGreaterThan(1)

      for (let i = 0; i < cardCount; i++) {
        const card = albumCards.nth(i)
        const caption = card.locator('.yun-album-caption')
        const desc = card.locator('.yun-album-desc')
        await expect(card).toHaveCSS('border-radius', '12px')
        await expect(caption).toBeVisible()
        await expect(desc).toBeVisible()

        const cardBox = await card.boundingBox()
        const captionBox = await caption.boundingBox()
        expect(cardBox).not.toBeNull()
        expect(captionBox).not.toBeNull()
        expect(captionBox!.y).toBeGreaterThanOrEqual(cardBox!.y)
        expect(captionBox!.y + captionBox!.height).toBeLessThanOrEqual(cardBox!.y + cardBox!.height + 1)
      }

      await page.setViewportSize({ width: 390, height: 844 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      await page.setViewportSize({ width: 1280, height: 800 })

      // 3. Gallery page (/albums/daily) back button
      await page.goto('/albums/daily', { waitUntil: 'domcontentloaded' })
      await waitForHydration(page)
      const backBtn = page.locator('.yun-gallery-back-btn')
      await expect(backBtn).toBeVisible()
      await expect(backBtn).toHaveClass(/\byun-action-btn\b/)
      await expect(backBtn).toHaveAttribute('type', 'button')
      expect(await backBtn.getAttribute('aria-label')).toBeTruthy()

      // 4. Post page: YunPostActions, YunSponsor, and YunPostNav
      await page.goto('/posts/design', { waitUntil: 'domcontentloaded' })
      await waitForHydration(page)

      const actionsBtn = page.locator('.yun-post-actions-btn')
      await expect(actionsBtn).toBeVisible()
      await expect(actionsBtn).toHaveClass(/\byun-action-btn\b/)
      await expect(actionsBtn).toHaveAttribute('type', 'button')

      const endLineHr = page.locator('.markdown-body .end hr.line').first()
      await expect(endLineHr).toBeVisible()
      await expect(endLineHr).toHaveCSS('height', '1px')
      expect(await endLineHr.evaluate(el => getComputedStyle(el, '::before').content)).toBe('none')

      const sponsorBtn = page.locator('.sponsor-button')
      await expect(sponsorBtn).toBeVisible()
      await expect(sponsorBtn).toHaveAttribute('type', 'button')
      await expect(sponsorBtn).toHaveAttribute('aria-expanded', 'false')

      await sponsorBtn.hover()
      if (colorScheme === 'dark') {
        const hoverBg = await sponsorBtn.evaluate(el => getComputedStyle(el).backgroundColor)
        expect(hoverBg).not.toBe('rgb(255, 255, 255)')
        expect(hoverBg).not.toBe('rgba(255, 255, 255, 0.9)')
      }

      await sponsorBtn.click()
      await expect(sponsorBtn).toHaveAttribute('aria-expanded', 'true')

      const qrContainer = page.locator('.qrcode-container')
      await expect(qrContainer).toHaveClass(/\bshow\b/)
      const methodCards = qrContainer.locator('.sponsor-method-card')
      const methodCount = await methodCards.count()
      expect(methodCount).toBeGreaterThan(0)

      for (let i = 0; i < methodCount; i++) {
        const card = methodCards.nth(i)
        await expect(card).toBeVisible()
        await expect(card).toHaveCSS('border-radius', '12px')
        const img = card.locator('.sponsor-method-img')
        await expect(img).toBeVisible()
        expect(await img.getAttribute('alt')).toBeTruthy()
        await expect(card.locator('.sponsor-method-label')).toBeVisible()
      }

      const postNav = page.locator('nav.post-nav')
      await expect(postNav).toBeVisible()
      const navLinks = postNav.locator('.post-nav-link')
      expect(await navLinks.count()).toBeGreaterThan(0)
      await expect(navLinks.first()).toHaveCSS('border-radius', '8px')
      await expect(navLinks.first()).toHaveCSS('text-transform', 'none')

      await page.setViewportSize({ width: 390, height: 844 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      await page.setViewportSize({ width: 1280, height: 800 })

      // 5. Archives page (/archives): sort button
      await page.goto('/archives', { waitUntil: 'domcontentloaded' })
      await waitForHydration(page)

      const sortBtn = page.locator('.yun-collapse-sort-btn')
      await expect(sortBtn).toBeVisible()
      await expect(sortBtn).toHaveClass(/\byun-action-btn\b/)
      await expect(sortBtn).toHaveAttribute('type', 'button')
      await expect(sortBtn).toHaveAttribute('aria-pressed', 'false')

      const yearsLocator = page.locator('.post-collapse .archive-year')
      const yearsBefore = await yearsLocator.allInnerTexts()
      expect(yearsBefore.length).toBeGreaterThan(1)

      await sortBtn.click()
      await expect(sortBtn).toHaveAttribute('aria-pressed', 'true')
      const yearsAfter = await yearsLocator.allInnerTexts()
      expect(yearsAfter).toEqual([...yearsBefore].reverse())

      // 6. Prose <hr> cloud divider vs structural footnotes-sep on /posts/hello-valaxy
      await page.goto('/posts/hello-valaxy', { waitUntil: 'domcontentloaded' })
      await waitForHydration(page)

      const proseHr = page.locator('.markdown-body hr:not(.line, .footnotes-sep)').first()
      await expect(proseHr).toBeVisible()
      await expect(proseHr).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      await expect(proseHr).toHaveCSS('height', '20px')
      const proseHrBgImage = await proseHr.evaluate(el => getComputedStyle(el).backgroundImage)
      expect(proseHrBgImage).toContain('linear-gradient')
      const proseHrBefore = await proseHr.evaluate((el) => {
        const style = getComputedStyle(el, '::before')
        return {
          content: style.content,
          width: style.width,
          height: style.height,
          maskImage: style.maskImage || style.webkitMaskImage,
        }
      })
      expect(proseHrBefore.content).not.toBe('none')
      expect(proseHrBefore.width).toBe('24px')
      expect(proseHrBefore.height).toBe('16px')
      expect(proseHrBefore.maskImage).toContain('data:image/svg+xml')

      const footnotesSep = page.locator('.markdown-body hr.footnotes-sep').first()
      await expect(footnotesSep).toBeVisible()
      await expect(footnotesSep).toHaveCSS('height', '1px')
      expect(await footnotesSep.evaluate(el => getComputedStyle(el, '::before').content)).toBe('none')
    })
  }
})
