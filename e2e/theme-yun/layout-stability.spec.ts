import { expect, test } from '@playwright/test'
import { setup, waitForHydration } from '../utils'

setup('theme-yun')

test.describe('Theme Yun layout stability, archives timeline, and route transitions', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 1280, height: 800 },
    ]) {
      test(`keeps left sidebar and main column anchored across archives, 3-col post, and aside-free page (${colorScheme}, ${viewport.width}px)`, async ({ page }) => {
        await page.route(/fonts\.(googleapis|loli)\.com/, route => route.fulfill({ contentType: 'text/css', body: '' }))
        await page.route('https://v1.hitokoto.cn/**', route => route.fulfill({
          json: { hitokoto: 'Stable layout quote.', from_who: 'Valaxy', from: 'E2E' },
        }))

        await page.setViewportSize(viewport)
        await page.emulateMedia({ colorScheme, reducedMotion: 'no-preference' })

        // 1. /archives: outer YunCard + refined vertical timeline + right Year Jump rail
        await page.goto('/archives', { waitUntil: 'domcontentloaded' })
        await waitForHydration(page)

        const mainCard = page.locator('.yun-main .yun-card.yun-main-card').first()
        await expect(mainCard).toBeVisible()
        await expect(page.locator('.yun-archive-total-collections')).toBeVisible()
        expect(await page.locator('.yun-timeline-row-badge').count()).toBeGreaterThan(0)

        const yearSections = page.locator('.yun-timeline-year')
        expect(await yearSections.count()).toBeGreaterThan(1)

        const [activeYearColor, inactiveYearColor] = await Promise.all([
          page.locator('.yun-timeline-year.is-active .archive-year').first().evaluate(el => getComputedStyle(el).color),
          page.locator('.yun-timeline-year:not(.is-active) .archive-year').first().evaluate(el => getComputedStyle(el).color),
        ])
        expect(activeYearColor).not.toBe(inactiveYearColor)

        const yearHeadings = page.locator('.post-collapse .archive-year')
        const rail = page.locator('.yun-archives-rail')
        await expect(rail).toBeVisible()
        const railYears = rail.locator('.yun-archives-rail-year')

        const expectedYears = await yearHeadings.allInnerTexts()
        expect(await railYears.allInnerTexts()).toEqual(expectedYears)
        await expect(rail.locator('.yun-archives-rail-meter-fill')).toHaveCount(expectedYears.length)

        const railTitleBox = await rail.locator('.yun-archives-rail-title').boundingBox()
        expect(railTitleBox).not.toBeNull()

        const sortBtn = page.locator('.yun-collapse-sort-btn')
        await sortBtn.click()
        await expect(sortBtn).toHaveAttribute('aria-pressed', 'true')
        expect(await railYears.allInnerTexts()).toEqual([...expectedYears].reverse())
        await sortBtn.click()
        await expect(sortBtn).toHaveAttribute('aria-pressed', 'false')

        const leftSidebar = page.locator('.yun-layout-left')
        const mainColumn = page.locator('.yun-main')
        const [archivesLeftBox, archivesMainBox] = await Promise.all([
          leftSidebar.boundingBox(),
          mainColumn.boundingBox(),
        ])
        expect(archivesLeftBox).not.toBeNull()
        expect(archivesMainBox).not.toBeNull()

        const collectionRow = page.locator('a.yun-timeline-row[href="/collections/love-and-peace/"]').first()
        const regularRow = page.locator('a.yun-timeline-row[href="/posts/hello-valaxy"]').first()
        const collectionTitle = collectionRow.locator('.yun-timeline-row-title')
        const collectionIcon = collectionRow.locator('.yun-timeline-row-icon')
        const collectionText = collectionRow.locator('.yun-timeline-row-title-text')
        await expect(collectionIcon).toBeVisible()
        await expect(collectionTitle).toHaveCSS('align-items', 'baseline')
        await expect(collectionIcon).not.toHaveCSS('align-self', 'center')
        const [colRowBox, regRowBox, iconBox, textBox] = await Promise.all([
          collectionRow.boundingBox(),
          regularRow.boundingBox(),
          collectionIcon.boundingBox(),
          collectionText.boundingBox(),
        ])
        expect(colRowBox).not.toBeNull()
        expect(regRowBox).not.toBeNull()
        expect(iconBox).not.toBeNull()
        expect(textBox).not.toBeNull()
        expect(Math.abs(colRowBox!.height - regRowBox!.height)).toBeLessThanOrEqual(1)
        expect(iconBox!.y).toBeGreaterThanOrEqual(textBox!.y - 1)
        expect(iconBox!.y + iconBox!.height).toBeLessThanOrEqual(textBox!.y + textBox!.height + 1)
        expect(iconBox!.height).toBeLessThan(textBox!.height)

        // Click near-bottom and bottom year links in the right rail and verify pinning + marker sync
        const secondLastYearLink = rail.locator('.yun-archives-rail-link').nth(-2)
        const secondLastHref = await secondLastYearLink.getAttribute('href')
        expect(secondLastHref).toMatch(/^#archive-year-\d+$/)
        const expectedSecondLastYear = ((await secondLastYearLink.locator('.yun-archives-rail-year').textContent()) ?? '').trim()
        await secondLastYearLink.click()
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100)
        await page.waitForTimeout(850)
        await expect(secondLastYearLink).toHaveClass(/\bactive\b/)
        await expect(page.locator('.yun-timeline-year.is-active .archive-year')).toHaveText(expectedSecondLastYear)
        await expect.poll(async () => page.evaluate((year) => {
          const link = document.querySelector<HTMLElement>(`.yun-archives-rail-link[data-year="${year}"]`)
          const marker = document.querySelector<HTMLElement>('.yun-archives-rail-marker')
          if (!link || !marker)
            return Number.POSITIVE_INFINITY
          const expected = link.offsetTop + (link.offsetHeight ? Math.round((link.offsetHeight - 18) / 2) : 5)
          return Math.abs(Number.parseFloat(marker.style.top || '0') - expected)
        }, expectedSecondLastYear)).toBeLessThanOrEqual(2)

        const lastYearLink = rail.locator('.yun-archives-rail-link').last()
        const lastHref = await lastYearLink.getAttribute('href')
        expect(lastHref).toMatch(/^#archive-year-\d+$/)
        const expectedLastYear = ((await lastYearLink.locator('.yun-archives-rail-year').textContent()) ?? '').trim()
        await lastYearLink.click()
        await page.waitForTimeout(850)
        await expect(lastYearLink).toHaveClass(/\bactive\b/)
        await expect(page.locator('.yun-timeline-year.is-active .archive-year')).toHaveText(expectedLastYear)
        await expect.poll(async () => page.evaluate((year) => {
          const link = document.querySelector<HTMLElement>(`.yun-archives-rail-link[data-year="${year}"]`)
          const marker = document.querySelector<HTMLElement>('.yun-archives-rail-marker')
          if (!link || !marker)
            return Number.POSITIVE_INFINITY
          const expected = link.offsetTop + (link.offsetHeight ? Math.round((link.offsetHeight - 18) / 2) : 5)
          return Math.abs(Number.parseFloat(marker.style.top || '0') - expected)
        }, expectedLastYear)).toBeLessThanOrEqual(2)

        // 2. Navigate via SPA link to a 3-column post with TOC
        const targetPostLink = page.locator('a.yun-timeline-row[href="/posts/hello-valaxy"]').first()
        await targetPostLink.click()
        await expect(page).toHaveURL(/\/posts\/hello-valaxy\/?$/)
        await page.waitForSelector('.markdown-body')
        await expect(page.locator('[data-yun-vt-page-title="/posts/hello-valaxy"]')).toBeVisible()

        const aside = page.locator('.yun-aside')
        await expect(aside).toBeVisible()
        await expect(aside).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
        await expect(aside).toHaveCSS('box-shadow', 'none')

        const outlineTitleBox = await aside.locator('.outline-title').boundingBox()
        expect(outlineTitleBox).not.toBeNull()
        expect(Math.abs(outlineTitleBox!.y - railTitleBox!.y)).toBeLessThanOrEqual(2)

        const [postLeftBox, postMainBox] = await Promise.all([
          leftSidebar.boundingBox(),
          mainColumn.boundingBox(),
        ])
        expect(postLeftBox).not.toBeNull()
        expect(postMainBox).not.toBeNull()
        expect(Math.abs(postLeftBox!.x - archivesLeftBox!.x)).toBeLessThanOrEqual(1)
        expect(Math.abs(postMainBox!.x - archivesMainBox!.x)).toBeLessThanOrEqual(1)

        await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('yun-route-transition'))).toBe(false)

        // 3. Navigate to a page with aside: false (no right rail)
        await page.goto('/examples/without-aside', { waitUntil: 'domcontentloaded' })
        await waitForHydration(page)

        await expect(page.locator('.yun-aside')).toHaveCount(0)
        const [noAsideLeftBox, noAsideMainBox] = await Promise.all([
          leftSidebar.boundingBox(),
          mainColumn.boundingBox(),
        ])
        expect(noAsideLeftBox).not.toBeNull()
        expect(noAsideMainBox).not.toBeNull()
        expect(Math.abs(noAsideLeftBox!.x - archivesLeftBox!.x)).toBeLessThanOrEqual(1)
        expect(Math.abs(noAsideMainBox!.x - archivesMainBox!.x)).toBeLessThanOrEqual(1)
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

        // 4. Toggle dark mode after navigation and verify clean state
        const toggleDarkBtn = page.locator('.yun-toggle-dark').first()
        const wasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
        await toggleDarkBtn.click()
        await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(!wasDark)
        await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('yun-route-transition'))).toBe(false)
      })
    }
  }

  test('renders mobile year pills on archives and cleans up sibling categories/tags hydration', async ({ page }) => {
    await page.route(/fonts\.(googleapis|loli)\.com/, route => route.fulfill({ contentType: 'text/css', body: '' }))
    await page.route('https://v1.hitokoto.cn/**', route => route.fulfill({
      json: { hitokoto: 'Stable layout quote.', from_who: 'Valaxy', from: 'E2E' },
    }))

    const hydrationWarnings: string[] = []
    page.on('console', (msg) => {
      const text = msg.text()
      if (text.toLowerCase().includes('hydration'))
        hydrationWarnings.push(text)
    })

    // Mobile archives year pills + overflow check
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' })
    await page.goto('/archives', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    const yearPills = page.locator('.yun-archive-year-pills')
    await expect(yearPills).toBeVisible()
    const targetPill = yearPills.locator('.yun-archive-year-pill').last()
    const pillYear = ((await targetPill.locator('span').first().textContent()) ?? '').trim()
    await targetPill.click()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100)
    await page.waitForTimeout(850)
    await expect(page.locator('.yun-timeline-year.is-active .archive-year')).toHaveText(pillYear)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

    // Sibling /categories and /tags with query params: zero hydration warnings and no empty bottom .yun-comment card
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/categories?category=%E4%B8%AD%E6%96%87%2F%E5%88%86%E7%B1%BB%2F%E6%B5%8B%E8%AF%95', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)
    await expect(page.locator('.post-item')).toHaveCount(1)
    await expect(page.locator('.yun-comment')).toHaveCount(0)

    await page.goto('/tags?tag=A', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)
    await expect(page.locator('.post-item')).toHaveCount(1)
    await expect(page.locator('.yun-comment')).toHaveCount(0)

    expect(hydrationWarnings).toEqual([])
  })

  test('preserves navbar frosted glass without white flash during route view transitions', async ({ page, context }) => {
    await page.route(/fonts\.(googleapis|loli)\.com/, route => route.fulfill({ contentType: 'text/css', body: '' }))
    await page.route('https://v1.hitokoto.cn/**', route => route.fulfill({
      json: { hitokoto: 'Stable layout quote.', from_who: 'Valaxy', from: 'E2E' },
    }))

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' })

    await page.goto('/posts/', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    // Ensure nav glass styles are active and settle initial fade-in animations deterministically.
    await expect.poll(() =>
      page.evaluate(() => getComputedStyle(document.querySelector('.yun-nav-menu')!, '::before').backdropFilter),
    ).toBe('blur(12px)')
    await page.evaluate(async () => {
      for (const el of document.querySelectorAll('.yun-page-header-gradient, .yun-bg')) {
        for (const anim of el.getAnimations())
          anim.finish()
      }
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    })

    async function sampleNavRegion() {
      const screenshot = await page.screenshot()
      const base64 = screenshot.toString('base64')
      return page.evaluate(async (b64) => {
        const img = new Image()
        img.src = `data:image/png;base64,${b64}`
        await img.decode()
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        const x = 400
        const y = 12
        const w = 60
        const h = 26
        const { data } = ctx.getImageData(x, y, w, h)
        let r = 0
        let g = 0
        let b = 0
        const count = w * h
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
        }
        return [Math.round(r / count), Math.round(g / count), Math.round(b / count)] as const
      }, base64)
    }

    const restRgb = await sampleNavRegion()

    const cdp = await context.newCDPSession(page)
    await cdp.send('Animation.enable')
    try {
      await cdp.send('Animation.setPlaybackRate', { playbackRate: 0.02 })

      await page.locator('.yun-nav-menu a[href="/moments/"]').click()
      await page.waitForFunction(() => {
        const root = document.documentElement
        return root.classList.contains('yun-route-transition')
          && getComputedStyle(root, '::view-transition-group(yun-nav)').zIndex === '20'
      })
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))

      const vtPseudoStyles = await page.evaluate(() => {
        const root = document.documentElement
        const oldNav = getComputedStyle(root, '::view-transition-old(yun-nav)')
        const newNav = getComputedStyle(root, '::view-transition-new(yun-nav)')
        const groupNav = getComputedStyle(root, '::view-transition-group(yun-nav)')
        const groupHeaderGrad = getComputedStyle(root, '::view-transition-group(yun-header-gradient)')
        return {
          oldNavDisplay: oldNav.display,
          newNavAnimation: newNav.animationName,
          newNavBlend: newNav.mixBlendMode,
          groupNavAnimation: groupNav.animationName,
          groupNavBackdrop: groupNav.backdropFilter,
          groupHeaderGradAnimation: groupHeaderGrad.animationName,
          groupHeaderGradZ: groupHeaderGrad.zIndex,
        }
      })

      expect(vtPseudoStyles).toEqual({
        oldNavDisplay: 'none',
        newNavAnimation: 'none',
        newNavBlend: 'normal',
        groupNavAnimation: 'none',
        groupNavBackdrop: 'blur(12px)',
        groupHeaderGradAnimation: 'none',
        groupHeaderGradZ: '25',
      })

      const midTransitionRgb = await sampleNavRegion()
      for (let i = 0; i < 3; i++)
        expect(Math.abs(midTransitionRgb[i] - restRgb[i])).toBeLessThanOrEqual(4)
    }
    finally {
      await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 }).catch(() => {})
      await cdp.detach().catch(() => {})
    }

    await expect(page).toHaveURL(/\/moments\/?$/)
    await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('yun-route-transition'))).toBe(false)
  })
})
