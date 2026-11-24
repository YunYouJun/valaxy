import { expect, test } from '@playwright/test'
import { env } from '../../env'
import { setup, waitForHydration } from '../../utils'

setup('theme-yun')

test.describe('Markdown: Typography & Theme Yun Decoupling', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`enforces Scheme A serif hierarchy, font stacks, dark-safe elements, and mobile framing in ${colorScheme} mode`, async ({ page }) => {
      await page.route(/fonts\.(googleapis|loli)\.com/, route => route.fulfill({ contentType: 'text/css', body: '' }))
      await page.route('https://v1.hitokoto.cn/**', route => route.fulfill({
        json: { hitokoto: 'Typography test quote.', from_who: 'Valaxy', from: 'E2E' },
      }))

      await page.setViewportSize({ width: 1280, height: 800 })
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })

      // 1. Heading size hierarchy, applied theme class, and Scheme A font pairing on /posts/long-toc
      await page.goto('/posts/long-toc', { waitUntil: 'domcontentloaded' })
      await waitForHydration(page)

      if (colorScheme === 'dark')
        await expect(page.locator('html')).toHaveClass(/\bdark\b/)
      else
        await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)

      const typography = await page.evaluate(() => {
        const resolveFont = (cssExpr: string) => {
          const probe = document.createElement('span')
          probe.style.fontFamily = cssExpr
          document.body.appendChild(probe)
          const family = getComputedStyle(probe).fontFamily
          probe.remove()
          return family
        }

        const pickVisible = (selector: string) => {
          const els = Array.from(document.querySelectorAll<HTMLElement>(selector))
          return els.find(el => getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0) || null
        }

        const postTitle = document.querySelector<HTMLElement>('h1.post-title')!
        const h2 = pickVisible('.markdown-body h2')!
        const h3 = pickVisible('.markdown-body h3')!
        const h4 = pickVisible('.markdown-body h4')!
        const card = document.querySelector<HTMLElement>('.yun-main .yun-card')!

        const base = {
          serif: resolveFont('var(--va-font-serif)'),
          sans: resolveFont('var(--va-font-sans)'),
          postTitle: {
            fontSize: Number.parseFloat(getComputedStyle(postTitle).fontSize),
            fontFamily: getComputedStyle(postTitle).fontFamily,
            fontWeight: getComputedStyle(postTitle).fontWeight,
          },
          h2: {
            fontSize: Number.parseFloat(getComputedStyle(h2).fontSize),
            fontFamily: getComputedStyle(h2).fontFamily,
            fontWeight: getComputedStyle(h2).fontWeight,
          },
          h3: {
            fontSize: Number.parseFloat(getComputedStyle(h3).fontSize),
            fontFamily: getComputedStyle(h3).fontFamily,
            fontWeight: getComputedStyle(h3).fontWeight,
          },
          h4: {
            fontSize: Number.parseFloat(getComputedStyle(h4).fontSize),
          },
        }

        card.setAttribute('data-yun-prose', 'editorial')
        const editorialH3Font = getComputedStyle(h3).fontFamily
        card.setAttribute('data-yun-prose', 'technical')
        const technicalFonts = {
          postTitle: getComputedStyle(postTitle).fontFamily,
          h2: getComputedStyle(h2).fontFamily,
        }
        card.removeAttribute('data-yun-prose')

        return { ...base, editorialH3Font, technicalFonts }
      })

      expect(typography.postTitle.fontSize).toBeGreaterThan(typography.h2.fontSize)
      expect(typography.h2.fontSize).toBeGreaterThan(typography.h3.fontSize)
      expect(typography.h3.fontSize).toBeGreaterThan(typography.h4.fontSize)

      expect(typography.postTitle.fontFamily).toBe(typography.serif)
      expect(typography.postTitle.fontWeight).toBe('700')
      expect(typography.h2.fontFamily).toBe(typography.serif)
      expect(typography.h2.fontWeight).toBe('700')
      expect(typography.h3.fontFamily).toBe(typography.sans)
      expect(typography.h3.fontWeight).toBe('600')
      expect(typography.editorialH3Font).toBe(typography.serif)
      expect(typography.technicalFonts.postTitle).toBe(typography.sans)
      expect(typography.technicalFonts.h2).toBe(typography.sans)

      // 2. Strong, mono fonts, links, scoped --va-c-link override, kbd, del, blockquote, and summary focus-visible on /posts/markdown
      await page.goto('/posts/markdown', { waitUntil: 'domcontentloaded' })
      await waitForHydration(page)

      const proseCheck = await page.evaluate(() => {
        const resolve = (prop: 'fontFamily' | 'color' | 'backgroundColor', cssExpr: string, parent: HTMLElement = document.body) => {
          const probe = document.createElement('span')
          probe.style[prop] = cssExpr
          parent.appendChild(probe)
          const value = getComputedStyle(probe)[prop]
          probe.remove()
          return value
        }

        const body = document.querySelector<HTMLElement>('.markdown-body')!
        const strong = body.querySelector<HTMLElement>('strong')!
        const inlineCode = body.querySelector<HTMLElement>(':not(pre) > code')!
        const preCode = body.querySelector<HTMLElement>('pre > code')!
        const lineNumbers = body.querySelector<HTMLElement>('.line-numbers-wrapper')!
        const link = body.querySelector<HTMLAnchorElement>(':scope > p a[href]')!
        const tableContainer = body.querySelector<HTMLElement>('.table-container')!

        const kbd = document.createElement('kbd')
        kbd.textContent = 'Ctrl'
        const del = document.createElement('del')
        del.textContent = 'Deprecated'
        const quote = document.createElement('blockquote')
        const quoteP = document.createElement('p')
        quoteP.textContent = 'Sample quote'
        quote.appendChild(quoteP)
        body.append(kbd, del, quote)

        const baseResult = {
          sans: resolve('fontFamily', 'var(--va-font-sans)'),
          serif: resolve('fontFamily', 'var(--va-font-serif)'),
          mono: resolve('fontFamily', 'var(--va-font-mono)'),
          expectedLinkColor: resolve('color', 'var(--va-c-link)'),
          expectedMutedColor: resolve('color', 'var(--va-c-text-2)'),
          expectedKbdBg: resolve('backgroundColor', 'var(--va-md-default-kbd-bg)', body),
          strong: {
            fontFamily: getComputedStyle(strong).fontFamily,
            fontWeight: getComputedStyle(strong).fontWeight,
          },
          inlineCodeFamily: getComputedStyle(inlineCode).fontFamily,
          preCodeFamily: getComputedStyle(preCode).fontFamily,
          lineNumbersFamily: getComputedStyle(lineNumbers).fontFamily,
          link: {
            color: getComputedStyle(link).color,
            textDecorationLine: getComputedStyle(link).textDecorationLine,
          },
          tableFrame: {
            borderTopWidth: getComputedStyle(tableContainer).borderTopWidth,
            borderTopLeftRadius: getComputedStyle(tableContainer).borderTopLeftRadius,
          },
          kbdBg: getComputedStyle(kbd).backgroundColor,
          delColor: getComputedStyle(del).color,
          quote: {
            color: getComputedStyle(quote).color,
            bg: getComputedStyle(quote).backgroundColor,
          },
        }

        body.style.setProperty('--va-c-link', 'rgb(220, 38, 38)')
        const scopedLinkColor = getComputedStyle(link).color
        body.style.removeProperty('--va-c-link')

        const card = document.querySelector<HTMLElement>('.yun-main .yun-card')!
        card.setAttribute('data-yun-prose', 'editorial')
        const editorialQuoteFont = getComputedStyle(quote).fontFamily
        card.removeAttribute('data-yun-prose')

        kbd.remove()
        del.remove()
        quote.remove()
        return { ...baseResult, scopedLinkColor, editorialQuoteFont }
      })

      expect(proseCheck.strong.fontFamily).toBe(proseCheck.sans)
      expect(proseCheck.strong.fontWeight).toBe('600')
      expect(proseCheck.inlineCodeFamily).toBe(proseCheck.mono)
      expect(proseCheck.preCodeFamily).toBe(proseCheck.mono)
      expect(proseCheck.lineNumbersFamily).toBe(proseCheck.mono)
      expect(proseCheck.link.color).toBe(proseCheck.expectedLinkColor)
      expect(proseCheck.link.textDecorationLine).toContain('underline')
      expect(proseCheck.tableFrame).toEqual({
        borderTopWidth: '1px',
        borderTopLeftRadius: '8px',
      })
      expect(proseCheck.scopedLinkColor).toBe('rgb(220, 38, 38)')
      expect(proseCheck.kbdBg).toBe(proseCheck.expectedKbdBg)
      expect(proseCheck.kbdBg).not.toBe('rgb(250, 251, 252)')
      expect(proseCheck.delColor).toBe(proseCheck.expectedMutedColor)
      expect(proseCheck.quote.color).toBe(proseCheck.expectedMutedColor)
      expect(proseCheck.quote.bg).not.toBe('rgba(0, 0, 0, 0)')
      expect(proseCheck.editorialQuoteFont).toBe(proseCheck.serif)

      // RTL blockquote mirrors inline-start accent border and outer logical radii
      const rtlQuoteRadii = await page.evaluate(() => {
        const body = document.querySelector<HTMLElement>('.markdown-body')!
        const quote = document.createElement('blockquote')
        quote.id = 'test-rtl-quote'
        quote.dir = 'rtl'
        const p = document.createElement('p')
        p.textContent = 'RTL quote'
        quote.appendChild(p)
        body.prepend(quote)
        const style = getComputedStyle(quote)
        const radii = {
          topLeft: style.borderTopLeftRadius,
          bottomLeft: style.borderBottomLeftRadius,
          topRight: style.borderTopRightRadius,
          bottomRight: style.borderBottomRightRadius,
        }
        quote.remove()
        return radii
      })
      expect(rtlQuoteRadii.topLeft).not.toBe('0px')
      expect(rtlQuoteRadii.bottomLeft).not.toBe('0px')
      expect(rtlQuoteRadii.topRight).toBe('0px')
      expect(rtlQuoteRadii.bottomRight).toBe('0px')

      // Classed <details> summary retains keyboard :focus-visible outline
      await page.evaluate(() => {
        const body = document.querySelector<HTMLElement>('.markdown-body')!
        const startBtn = document.createElement('button')
        startBtn.type = 'button'
        startBtn.id = 'test-focus-start'
        startBtn.textContent = 'Start'
        const details = document.createElement('details')
        details.className = 'custom-disclosure'
        const summary = document.createElement('summary')
        summary.id = 'test-classed-summary'
        summary.textContent = 'Classed disclosure'
        const p = document.createElement('p')
        p.textContent = 'Content'
        details.append(summary, p)
        body.prepend(startBtn, details)
      })
      await page.locator('#test-focus-start').focus()
      await page.keyboard.press('Tab')
      const classedSummary = page.locator('#test-classed-summary')
      await expect(classedSummary).toBeFocused()
      const outline = await classedSummary.evaluate((el) => {
        const style = getComputedStyle(el)
        return { style: style.outlineStyle, width: Number.parseFloat(style.outlineWidth) }
      })
      expect(outline.style).not.toBe('none')
      expect(outline.width).toBeGreaterThan(0)
      await page.evaluate(() => {
        document.getElementById('test-focus-start')?.remove()
        document.querySelector('details.custom-disclosure')?.remove()
      })

      // Interactive code-group tab switching
      const codeGroup = page.locator('.markdown-body .vp-code-group').first()
      const secondLabel = codeGroup.locator('.tabs label').nth(1)
      const secondFence = codeGroup.locator('div[class*="language-"]').nth(1)
      await secondLabel.scrollIntoViewIfNeeded()
      await secondLabel.click()
      await expect(secondFence).toHaveClass(/\bactive\b/)
      await expect(secondFence).toBeVisible()

      // 3. Mobile framing: top-level bleed, .tabs containment, disclosure/blockquote code wrappers, and hash scroll clearance
      await page.setViewportSize({ width: 390, height: 844 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

      const mobileBleed = await page.evaluate(() => {
        const readBoxMetrics = (el: HTMLElement) => {
          const style = getComputedStyle(el)
          return {
            marginLeft: style.marginLeft,
            marginRight: style.marginRight,
            borderTopWidth: style.borderTopWidth,
            borderRightWidth: style.borderRightWidth,
            borderBottomWidth: style.borderBottomWidth,
            borderLeftWidth: style.borderLeftWidth,
            borderTopLeftRadius: style.borderTopLeftRadius,
            borderTopRightRadius: style.borderTopRightRadius,
            borderBottomRightRadius: style.borderBottomRightRadius,
            borderBottomLeftRadius: style.borderBottomLeftRadius,
          }
        }
        const body = document.querySelector<HTMLElement>('.markdown-body')!
        const topFence = body.querySelector<HTMLElement>(':scope > div[class*="language-"]')!
        const topGroup = body.querySelector<HTMLElement>(':scope > .vp-code-group')!
        const topTabs = topGroup.querySelector<HTMLElement>('.tabs')!
        const tabsStyle = getComputedStyle(topTabs)
        return {
          fence: readBoxMetrics(topFence),
          group: readBoxMetrics(topGroup),
          tabs: {
            marginLeft: tabsStyle.marginLeft,
            marginRight: tabsStyle.marginRight,
          },
        }
      })
      const expectedBleedMetrics = {
        marginLeft: '-24px',
        marginRight: '-24px',
        borderTopWidth: '1px',
        borderRightWidth: '0px',
        borderBottomWidth: '1px',
        borderLeftWidth: '0px',
        borderTopLeftRadius: '0px',
        borderTopRightRadius: '0px',
        borderBottomRightRadius: '0px',
        borderBottomLeftRadius: '0px',
      }
      expect(mobileBleed.fence).toEqual(expectedBleedMetrics)
      expect(mobileBleed.group).toEqual(expectedBleedMetrics)
      expect(mobileBleed.tabs).toEqual({
        marginLeft: '0px',
        marginRight: '0px',
      })

      const [topGroupBox, topFirstTabBox, topSecondTabBox] = await Promise.all([
        page.locator('.markdown-body > .vp-code-group').first().boundingBox(),
        page.locator('.markdown-body > .vp-code-group').first().locator('.tabs label').nth(0).boundingBox(),
        page.locator('.markdown-body > .vp-code-group').first().locator('.tabs label').nth(1).boundingBox(),
      ])
      expect(topGroupBox).not.toBeNull()
      for (const tabBox of [topFirstTabBox, topSecondTabBox]) {
        expect(tabBox).not.toBeNull()
        expect(tabBox!.height).toBeGreaterThan(0)
        expect(tabBox!.x).toBeGreaterThanOrEqual(topGroupBox!.x - 1)
        expect(tabBox!.x + tabBox!.width).toBeLessThanOrEqual(topGroupBox!.x + topGroupBox!.width + 1)
      }

      await page.evaluate(() => {
        const body = document.querySelector<HTMLElement>('.markdown-body')!
        const firstGroup = body.querySelector<HTMLElement>('.vp-code-group')!
        const details = document.createElement('details')
        details.id = 'test-details-code-group'
        details.open = true
        details.style.setProperty('--yun-details-radius', '14px')
        const summary = document.createElement('summary')
        summary.textContent = 'Mobile code group disclosure'
        details.append(summary, firstGroup.cloneNode(true))
        body.prepend(details)
      })
      const [detailsGroupBox, detailsGroupWrapperBox, detailsGroupTabBox, detailsGroupStyles] = await Promise.all([
        page.locator('#test-details-code-group').boundingBox(),
        page.locator('#test-details-code-group .vp-code-group').boundingBox(),
        page.locator('#test-details-code-group .vp-code-group .tabs label').first().boundingBox(),
        page.locator('#test-details-code-group .vp-code-group').evaluate((el) => {
          const style = getComputedStyle(el)
          const tabsStyle = getComputedStyle(el.querySelector('.tabs')!)
          return {
            marginTop: style.marginTop,
            marginBottom: style.marginBottom,
            borderTopWidth: style.borderTopWidth,
            borderRightWidth: style.borderRightWidth,
            borderBottomWidth: style.borderBottomWidth,
            borderLeftWidth: style.borderLeftWidth,
            borderTopLeftRadius: style.borderTopLeftRadius,
            borderTopRightRadius: style.borderTopRightRadius,
            borderBottomRightRadius: style.borderBottomRightRadius,
            borderBottomLeftRadius: style.borderBottomLeftRadius,
            tabsMarginLeft: tabsStyle.marginLeft,
            tabsMarginRight: tabsStyle.marginRight,
          }
        }),
      ])
      expect(detailsGroupBox).not.toBeNull()
      expect(detailsGroupWrapperBox).not.toBeNull()
      expect(detailsGroupTabBox).not.toBeNull()
      expect(detailsGroupStyles).toEqual({
        marginTop: '0px',
        marginBottom: '0px',
        borderTopWidth: '1px',
        borderRightWidth: '1px',
        borderBottomWidth: '1px',
        borderLeftWidth: '1px',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        borderBottomRightRadius: '12px',
        borderBottomLeftRadius: '12px',
        tabsMarginLeft: '0px',
        tabsMarginRight: '0px',
      })
      expect(detailsGroupWrapperBox!.x).toBeGreaterThanOrEqual(detailsGroupBox!.x - 1)
      expect(detailsGroupWrapperBox!.x + detailsGroupWrapperBox!.width).toBeLessThanOrEqual(detailsGroupBox!.x + detailsGroupBox!.width + 1)
      expect(detailsGroupTabBox!.height).toBeGreaterThan(0)
      expect(detailsGroupTabBox!.x).toBeGreaterThanOrEqual(detailsGroupWrapperBox!.x - 1)
      expect(detailsGroupTabBox!.x + detailsGroupTabBox!.width).toBeLessThanOrEqual(detailsGroupWrapperBox!.x + detailsGroupWrapperBox!.width + 1)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

      await page.goto('/test/custom-blocks', { waitUntil: 'domcontentloaded' })
      await waitForHydration(page)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

      await page.goto('/posts/code-icon', { waitUntil: 'domcontentloaded' })
      await waitForHydration(page)
      await page.evaluate(() => {
        const body = document.querySelector<HTMLElement>('.markdown-body')!
        const firstTitled = body.querySelector<HTMLElement>('.vp-code-block-title')!
        const quote = document.createElement('blockquote')
        quote.id = 'test-titled-quote'
        quote.appendChild(firstTitled.cloneNode(true))

        const details = document.createElement('details')
        details.id = 'test-details-code-title'
        details.open = true
        details.style.setProperty('--yun-details-radius', '14px')
        const summary = document.createElement('summary')
        summary.textContent = 'Mobile titled fence disclosure'
        details.append(summary, firstTitled.cloneNode(true))

        body.prepend(details, quote)
      })
      const [quoteBox, barBox, fenceBox, detailsTitleBox, detailsTitleWrapperBox, detailsTitleBarBox, detailsTitleStyles] = await Promise.all([
        page.locator('#test-titled-quote').boundingBox(),
        page.locator('#test-titled-quote .vp-code-block-title-bar').boundingBox(),
        page.locator('#test-titled-quote div[class*="language-"]').boundingBox(),
        page.locator('#test-details-code-title').boundingBox(),
        page.locator('#test-details-code-title .vp-code-block-title').boundingBox(),
        page.locator('#test-details-code-title .vp-code-block-title-bar').boundingBox(),
        page.locator('#test-details-code-title .vp-code-block-title').evaluate((el) => {
          const style = getComputedStyle(el)
          return {
            marginTop: style.marginTop,
            marginBottom: style.marginBottom,
            borderTopWidth: style.borderTopWidth,
            borderRightWidth: style.borderRightWidth,
            borderBottomWidth: style.borderBottomWidth,
            borderLeftWidth: style.borderLeftWidth,
            borderTopLeftRadius: style.borderTopLeftRadius,
            borderTopRightRadius: style.borderTopRightRadius,
            borderBottomRightRadius: style.borderBottomRightRadius,
            borderBottomLeftRadius: style.borderBottomLeftRadius,
          }
        }),
      ])
      expect(quoteBox).not.toBeNull()
      expect(barBox).not.toBeNull()
      expect(fenceBox).not.toBeNull()
      expect(barBox!.x).toBeGreaterThanOrEqual(quoteBox!.x - 1)
      expect(barBox!.x + barBox!.width).toBeLessThanOrEqual(quoteBox!.x + quoteBox!.width + 1)
      expect(fenceBox!.x).toBeGreaterThanOrEqual(quoteBox!.x - 1)
      expect(fenceBox!.x + fenceBox!.width).toBeLessThanOrEqual(quoteBox!.x + quoteBox!.width + 1)
      expect(detailsTitleBox).not.toBeNull()
      expect(detailsTitleWrapperBox).not.toBeNull()
      expect(detailsTitleBarBox).not.toBeNull()
      expect(detailsTitleStyles).toEqual({
        marginTop: '0px',
        marginBottom: '0px',
        borderTopWidth: '1px',
        borderRightWidth: '1px',
        borderBottomWidth: '1px',
        borderLeftWidth: '1px',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        borderBottomRightRadius: '12px',
        borderBottomLeftRadius: '12px',
      })
      expect(detailsTitleWrapperBox!.x).toBeGreaterThanOrEqual(detailsTitleBox!.x - 1)
      expect(detailsTitleWrapperBox!.x + detailsTitleWrapperBox!.width).toBeLessThanOrEqual(detailsTitleBox!.x + detailsTitleBox!.width + 1)
      expect(detailsTitleBarBox!.x).toBeGreaterThanOrEqual(detailsTitleBox!.x - 1)
      expect(detailsTitleBarBox!.x + detailsTitleBarBox!.width).toBeLessThanOrEqual(detailsTitleBox!.x + detailsTitleBox!.width + 1)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

      // Hash scroll respects computed scroll-margin-top on mobile stacked nav (non-clamped heading)
      await page.goto('/posts/long-toc', { waitUntil: 'domcontentloaded' })
      await waitForHydration(page)
      await page.evaluate(() => {
        const body = document.querySelector<HTMLElement>('.markdown-body')!
        const link = document.createElement('a')
        link.id = 'test-hash-jump'
        link.href = '#toc-1'
        link.textContent = 'Jump to TOC 1'
        body.prepend(link)
      })
      const expectedScrollMargin = await page.locator('#toc-1').evaluate(el => Number.parseFloat(getComputedStyle(el).scrollMarginTop))
      expect(expectedScrollMargin).toBeGreaterThan(90)
      await page.locator('#test-hash-jump').click()
      await expect(page).toHaveURL(/#toc-1$/)
      await expect.poll(async () =>
        page.locator('#toc-1').evaluate(el => Math.abs(el.getBoundingClientRect().top - Number.parseFloat(getComputedStyle(el).scrollMarginTop))),
      ).toBeLessThanOrEqual(12)
      expect(await page.evaluate(() => window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 20)).toBe(true)

      // 4. Nested list marker check on /posts/markdown-styles
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.goto('/posts/markdown-styles', { waitUntil: 'domcontentloaded' })
      await waitForHydration(page)

      const listStyles = await page.evaluate(() => {
        const ol = document.querySelector('.markdown-body ol')!
        const nestedUl = ol.querySelector('ul')!
        return {
          olType: getComputedStyle(ol).listStyleType,
          nestedUlType: getComputedStyle(nestedUl).listStyleType,
        }
      })

      expect(listStyles.olType).toBe('decimal')
      expect(listStyles.nestedUlType).toBe('disc')
    })
  }

  test('touch devices keep code copy button visible without overflowing', async ({ browser }) => {
    const context = await browser.newContext({
      baseURL: env['theme-yun'],
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    })
    const page = await context.newPage()
    await page.route(/fonts\.(googleapis|loli)\.com/, route => route.fulfill({ contentType: 'text/css', body: '' }))
    await page.route('https://v1.hitokoto.cn/**', route => route.fulfill({
      json: { hitokoto: 'Touch test quote.', from_who: 'Valaxy', from: 'E2E' },
    }))

    try {
      await page.goto('/posts/markdown', { waitUntil: 'domcontentloaded' })
      await waitForHydration(page)

      const firstFence = page.locator('.markdown-body div[class*="language-"]').first()
      await expect(firstFence.locator('> button.copy')).toHaveCSS('opacity', '0.75')
      await expect(firstFence.locator('> span.lang')).toHaveCSS('opacity', '0')
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    }
    finally {
      await context.close()
    }
  })
})
