import { expect, test } from '@playwright/test'
import { setup, waitForHydration } from '../utils'

setup('theme-yun')

test.describe('Theme Yun dark palette and component surfaces', () => {
  test('enforces dark surface ladder, readable sky-blue links, elevated sub-cards, category buttons, copyright, and time warning', async ({ page }) => {
    await page.route(/fonts\.(googleapis|loli)\.com/, route => route.fulfill({ contentType: 'text/css', body: '' }))
    await page.route('https://v1.hitokoto.cn/**', route => route.fulfill({
      json: { hitokoto: 'Dark palette test quote.', from_who: 'Valaxy', from: 'E2E' },
    }))

    await page.setViewportSize({ width: 1280, height: 800 })
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })

    // 1. Dark palette tokens & WCAG contrast on card surface
    await page.goto('/albums', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    const tokenCheck = await page.evaluate(() => {
      const root = document.documentElement
      const toRgb = (cssExpr: string) => {
        const probe = document.createElement('div')
        probe.style.color = cssExpr
        document.body.appendChild(probe)
        const computed = getComputedStyle(probe).color
        probe.remove()

        const canvas = document.createElement('canvas')
        canvas.width = 1
        canvas.height = 1
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = computed
        ctx.fillRect(0, 0, 1, 1)
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
        return { r, g, b, a, raw: computed }
      }

      const luminance = (rgb: { r: number, g: number, b: number }) => {
        const linear = [rgb.r, rgb.g, rgb.b].map((c) => {
          const v = c / 255
          return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
        })
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
      }

      const bgLight = toRgb('var(--va-c-bg-light)')
      const link = toRgb('var(--va-c-link)')
      const lBg = luminance(bgLight)
      const lLink = luminance(link)
      const contrast = (Math.max(lBg, lLink) + 0.05) / (Math.min(lBg, lLink) + 0.05)

      const albumCard = document.querySelector('.yun-album-card')!
      const mainCard = document.querySelector('.yun-main .yun-card')!

      return {
        isDark: root.classList.contains('dark'),
        bg: toRgb('var(--va-c-bg)'),
        bgLight,
        bgSoft: toRgb('var(--va-c-bg-soft)'),
        bgElevated: toRgb('var(--yun-bg-elevated)'),
        surfaceLine: toRgb('var(--yun-surface-line)'),
        contrast,
        albumBg: getComputedStyle(albumCard).backgroundColor,
        mainCardBg: getComputedStyle(mainCard).backgroundColor,
      }
    })

    expect(tokenCheck.isDark).toBe(true)
    expect(tokenCheck.surfaceLine.r).toBe(255)
    expect(tokenCheck.surfaceLine.g).toBe(255)
    expect(tokenCheck.surfaceLine.b).toBe(255)
    expect(tokenCheck.surfaceLine.a).toBeGreaterThanOrEqual(20)
    expect(tokenCheck.surfaceLine.a).toBeLessThanOrEqual(26)
    expect(tokenCheck.bgSoft).toEqual(expect.objectContaining({ r: 23, g: 25, b: 33 }))
    expect(tokenCheck.bgElevated).toEqual(expect.objectContaining({ r: 35, g: 38, b: 49 }))
    expect(tokenCheck.bgLight).toEqual(expect.objectContaining({ r: 28, g: 30, b: 38 }))
    expect(tokenCheck.albumBg).not.toBe(tokenCheck.mainCardBg)
    expect(tokenCheck.contrast).toBeGreaterThanOrEqual(6)

    // 2. Post page: time warning callout & copyright card
    await page.goto('/posts/design', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    const timeWarning = page.locator('.yun-time-warning')
    await expect(timeWarning).toBeVisible()
    await expect(timeWarning).toHaveAttribute('role', 'note')
    await expect(timeWarning).toHaveCSS('border-radius', '8px')
    await expect(timeWarning).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')

    const copyright = page.locator('.post-copyright')
    await expect(copyright).toBeVisible()
    await expect(copyright).toHaveCSS('border-radius', '8px')
    await expect(copyright.locator('.post-copyright-link a')).toHaveAttribute('rel', 'noopener noreferrer')

    // 3. Categories page: semantic toggle button & dark-safe count badge
    await page.goto('/categories', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    const folderBtn = page.locator('.folder-action').first()
    await expect(folderBtn).toBeVisible()
    await expect(folderBtn).toHaveAttribute('type', 'button')
    const initialExpanded = await folderBtn.getAttribute('aria-expanded')
    await folderBtn.click()
    await expect(folderBtn).toHaveAttribute('aria-expanded', initialExpanded === 'true' ? 'false' : 'true')

    const countBadge = page.locator('.category-count').first()
    await expect(countBadge).toBeVisible()
    await expect(countBadge).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0.05)')

    // 4. Mobile dark layout check (no horizontal overflow on borderless mobile main card)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/posts/design', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })

  test('aligns /links/ and /girls/ dark surfaces, typography, and mobile layouts', async ({ page }) => {
    await page.route(/fonts\.(googleapis|loli)\.com/, route => route.fulfill({ contentType: 'text/css', body: '' }))
    await page.route('https://wives.yunyoujun.cn/girls.json', route => route.fulfill({
      json: [
        { name: 'Test Girl 1', from: 'Test Series', avatar: '' },
        { name: 'Test Girl 2', from: 'Test Series', avatar: '' },
      ],
    }))

    await page.setViewportSize({ width: 1280, height: 800 })
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })

    // 1. /links/ card alignment in dark mode
    await page.goto('/links/', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    const linkCard = page.locator('.yun-links .yun-link-url').first()
    await expect(linkCard).toBeVisible()
    await expect(linkCard).toHaveCSS('border-radius', '12px')
    await expect(linkCard).toHaveCSS('text-decoration-line', 'none')
    await expect(linkCard.locator('.yun-link-arrow')).toBeVisible()

    const linkColors = await linkCard.evaluate((card) => {
      const mainCard = document.querySelector('.yun-main .yun-card')!
      const avatar = card.querySelector('.yun-link-avatar')!
      return {
        cardBg: getComputedStyle(card).backgroundColor,
        mainCardBg: getComputedStyle(mainCard).backgroundColor,
        avatarBg: getComputedStyle(avatar).backgroundColor,
      }
    })
    expect(linkColors.cardBg).not.toBe(linkColors.mainCardBg)
    expect(linkColors.avatarBg).not.toBe('rgb(255, 255, 255)')

    await page.setViewportSize({ width: 390, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

    // 2. /girls/ elevated surface and grid alignment in dark mode
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/girls/', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    const firstGirls = page.locator('.valaxy-girls').first()
    const gridSwitch = firstGirls.getByRole('button', { name: /紧凑卡片|Compact grid/ })
    await gridSwitch.click()
    await expect(gridSwitch).toHaveAttribute('aria-pressed', 'true')

    const girlCard = firstGirls.locator('.valaxy-girl-card').first()
    await expect(girlCard).toBeVisible()
    await expect(girlCard).toHaveCSS('border-radius', '12px')
    await expect(girlCard.locator('.valaxy-girl-arrow')).toBeVisible()

    const girlSurface = await girlCard.evaluate((card) => {
      const mainCard = document.querySelector('.yun-main .yun-card')!
      return {
        girlCardBg: getComputedStyle(card).backgroundColor,
        mainCardBg: getComputedStyle(mainCard).backgroundColor,
      }
    })
    expect(girlSurface.girlCardBg).not.toBe(girlSurface.mainCardBg)

    await page.setViewportSize({ width: 390, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
})
