import { expect, test } from '@playwright/test'
import { setup, waitForHydration } from '../../utils'

setup('theme-yun')

test.describe('Markdown: Custom Container', () => {
  test('Custom Title', async ({ page }) => {
    await page.goto('/test/custom-blocks', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.custom-block-title')

    const customDangerTitle = await page.locator('.custom-block-title').nth(5).textContent()
    expect(customDangerTitle).toContain('自定义标题')

    // 第二个 details summary 为自定义标题
    const customDetailsSummary = await page.locator('details summary').nth(1).textContent()
    expect(customDetailsSummary).toContain('自定义标题')
  })

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`details disclosure appearance and mobile code block framing in ${colorScheme} mode`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })
      await page.goto('/test/custom-blocks', { waitUntil: 'domcontentloaded' })
      await waitForHydration(page)

      const containerDetails = page.locator('.markdown-body details.custom-block.details').nth(1)
      const rawDetails = page.locator('.markdown-body details:not([class])').first()
      const openDetails = page.locator('.markdown-body details:not([class])').nth(1)
      const codeGroupDetails = page.locator('.markdown-body details.custom-block.details').nth(2)

      await expect(openDetails).toHaveAttribute('open', '')

      for (const details of [containerDetails, rawDetails, openDetails, codeGroupDetails]) {
        await expect(details).toBeVisible()
        await expect(details).toHaveCSS('border-radius', '8px')
        await expect(details).toHaveCSS('border-top-width', '1px')
        await expect(details).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')

        const summary = details.locator(':scope > summary')
        await expect(summary).toHaveCSS('cursor', 'pointer')
        const chevronContent = await summary.evaluate(el => getComputedStyle(el, '::before').content)
        expect(chevronContent).not.toBe('none')
      }

      // Open container details and verify link color matches Yun's --va-c-link
      await containerDetails.locator(':scope > summary').click()
      await expect(containerDetails).toHaveAttribute('open', '')
      await expect(containerDetails.locator(':scope > summary + p')).toHaveCSS('margin-top', '0px')
      const detailsLink = containerDetails.locator('a').first()
      await expect(detailsLink).toBeVisible()
      const colors = await detailsLink.evaluate((el) => {
        const probe = document.createElement('span')
        probe.style.color = 'var(--va-c-link)'
        el.parentElement!.appendChild(probe)
        const expected = getComputedStyle(probe).color
        probe.remove()
        return { actual: getComputedStyle(el).color, expected }
      })
      expect(colors.actual).toBe(colors.expected)

      // Open raw details containing list, link, inline code, and fenced TS block
      await rawDetails.locator(':scope > summary').click()
      await expect(rawDetails).toHaveAttribute('open', '')
      const codeBlock = rawDetails.locator('div[class*="language-"]').first()
      await expect(codeBlock).toBeVisible()
      await expect(codeBlock).toHaveCSS('margin-bottom', '0px')

      // Verify initially open details: heading spacing/anchor framing, list paragraphs, and nested warning block colors
      const nestedHeading = openDetails.locator('h3').first()
      await expect(nestedHeading).toBeVisible()
      await expect(nestedHeading).toHaveCSS('margin-top', '0px')
      const headingAnchor = nestedHeading.locator('.header-anchor')
      const [openBox, anchorBox] = await Promise.all([
        openDetails.boundingBox(),
        headingAnchor.boundingBox(),
      ])
      expect(openBox).not.toBeNull()
      expect(anchorBox).not.toBeNull()
      expect(anchorBox!.x).toBeGreaterThanOrEqual(openBox!.x - 1)

      const listParagraph = openDetails.locator('ul li > p').first()
      await expect(listParagraph).toHaveCSS('margin-bottom', '0px')

      const nestedWarningLink = openDetails.locator('.custom-block.warning a').first()
      await expect(nestedWarningLink).toBeVisible()
      const warningColors = await nestedWarningLink.evaluate((el) => {
        const probe = document.createElement('span')
        probe.style.color = 'var(--va-c-warning-1)'
        el.parentElement!.appendChild(probe)
        const expected = getComputedStyle(probe).color
        probe.remove()
        return { actual: getComputedStyle(el).color, expected }
      })
      expect(warningColors.actual).toBe(warningColors.expected)

      // Open code-group details and verify heading anchor copied-state color, nested warning semantics, and mobile bounds
      await codeGroupDetails.locator(':scope > summary').click()
      await expect(codeGroupDetails).toHaveAttribute('open', '')

      const directiveAnchor = codeGroupDetails.locator('h3 .header-anchor').first()
      await expect(directiveAnchor).toBeAttached()
      await directiveAnchor.click()
      await expect(directiveAnchor).toHaveClass(/\bis-copied\b/)
      const copiedColor = await directiveAnchor.evaluate((el) => {
        const probe = document.createElement('span')
        probe.style.color = 'var(--va-header-anchor-copied-color, var(--va-c-green-1))'
        el.parentElement!.appendChild(probe)
        const expected = getComputedStyle(probe).color
        probe.remove()
        return { actual: getComputedStyle(el).color, expected }
      })
      expect(copiedColor.actual).toBe(copiedColor.expected)

      const directiveWarningLink = codeGroupDetails.locator('.custom-block.warning a').first()
      const directiveWarningCode = codeGroupDetails.locator('.custom-block.warning code').first()
      const directiveWarningStyles = await directiveWarningLink.evaluate((link, code) => {
        const linkProbe = document.createElement('span')
        linkProbe.style.color = 'var(--va-c-warning-1)'
        const codeProbe = document.createElement('span')
        codeProbe.style.backgroundColor = 'var(--va-custom-block-warning-code-bg)'
        link.parentElement!.append(linkProbe, codeProbe)
        const result = {
          linkActual: getComputedStyle(link).color,
          linkExpected: getComputedStyle(linkProbe).color,
          codeBgActual: getComputedStyle(code).backgroundColor,
          codeBgExpected: getComputedStyle(codeProbe).backgroundColor,
        }
        linkProbe.remove()
        codeProbe.remove()
        return result
      }, await directiveWarningCode.elementHandle())
      expect(directiveWarningStyles.linkActual).toBe(directiveWarningStyles.linkExpected)
      expect(directiveWarningStyles.codeBgActual).toBe(directiveWarningStyles.codeBgExpected)

      await page.setViewportSize({ width: 390, height: 844 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

      const listCodeBlock = openDetails.locator('li div[class*="language-"]').first()
      const codeGroupTabs = codeGroupDetails.locator('.vp-code-group .tabs').first()
      const codeGroupFence = codeGroupDetails.locator('.vp-code-group div[class*="language-"].active').first()

      const [
        rawBox,
        rawCodeBox,
        openMobileBox,
        listCodeBox,
        groupDetailsBox,
        tabsBox,
        groupFenceBox,
      ] = await Promise.all([
        rawDetails.boundingBox(),
        codeBlock.boundingBox(),
        openDetails.boundingBox(),
        listCodeBlock.boundingBox(),
        codeGroupDetails.boundingBox(),
        codeGroupTabs.boundingBox(),
        codeGroupFence.boundingBox(),
      ])

      for (const pair of [
        [rawBox, rawCodeBox],
        [openMobileBox, listCodeBox],
        [groupDetailsBox, tabsBox],
        [groupDetailsBox, groupFenceBox],
      ] as const) {
        expect(pair[0]).not.toBeNull()
        expect(pair[1]).not.toBeNull()
        expect(pair[1]!.x).toBeGreaterThanOrEqual(pair[0]!.x - 1)
        expect(pair[1]!.x + pair[1]!.width).toBeLessThanOrEqual(pair[0]!.x + pair[0]!.width + 1)
      }
    })
  }

  test('details supports normal-motion animation, keyboard toggle, and forced-colors indicator', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' })
    await page.goto('/test/custom-blocks', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    const rawDetails = page.locator('.markdown-body details:not([class])').first()
    const summary = rawDetails.locator(':scope > summary')

    const collapsedHeight = (await rawDetails.boundingBox())!.height
    expect(collapsedHeight).toBeLessThan(65)

    // Keyboard focus & Enter to open (exercising progressive ::details-content transition)
    await summary.focus()
    await expect(summary).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(rawDetails).toHaveAttribute('open', '')

    await expect.poll(async () => (await rawDetails.boundingBox())!.height).toBeGreaterThan(150)
    await expect(rawDetails.locator('div[class*="language-"]').first()).toBeVisible()

    // Keyboard Space to close cleanly back to collapsed height
    await page.keyboard.press('Space')
    await expect(rawDetails).not.toHaveAttribute('open', '')
    await expect.poll(async () => (await rawDetails.boundingBox())!.height).toBeLessThan(65)

    // Forced-colors mode keeps the disclosure indicator visible against surface background
    await page.emulateMedia({ forcedColors: 'active' })
    const indicatorContrast = await summary.evaluate((el) => {
      const beforeBg = getComputedStyle(el, '::before').backgroundColor
      const bodyBg = getComputedStyle(document.body).backgroundColor
      return { beforeBg, bodyBg }
    })
    expect(indicatorContrast.beforeBg).not.toBe('rgba(0, 0, 0, 0)')
    expect(indicatorContrast.beforeBg).not.toBe(indicatorContrast.bodyBg)
  })
})
