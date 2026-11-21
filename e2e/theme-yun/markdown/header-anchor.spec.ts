import { expect, test } from '@playwright/test'
import { setup, waitForHydration } from '../../utils'

setup('theme-yun')

test.describe('Markdown: Header Anchor', () => {
  test.describe.configure({ mode: 'default' })

  test('desktop keeps left-gutter alignment without clipping, supports two-stage highlight, and copies link with check feedback', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.clock.install()
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/posts/hello-valaxy', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    const card = page.locator('.yun-main .yun-card').first()
    const heading = page.locator('.markdown-body h2#a-vue-component-in-your-post')
    const anchor = heading.locator('> .header-anchor')

    await heading.scrollIntoViewIfNeeded()
    await expect(anchor).toHaveCSS('position', 'absolute')
    await expect(anchor).toHaveCSS('opacity', '0')

    // Stage 1: hovering heading reveals muted anchor sliding gently out into left gutter
    await heading.hover()
    await expect(anchor).toHaveCSS('opacity', '0.85')
    await expect(anchor).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')

    const stage1 = await anchor.evaluate((el) => {
      const style = getComputedStyle(el)
      const before = getComputedStyle(el, '::before')
      return {
        color: style.color,
        beforeFontSize: Number.parseFloat(before.fontSize),
        beforeContent: before.content,
      }
    })
    const headingFontSize = await heading.evaluate(el => Number.parseFloat(getComputedStyle(el).fontSize))
    expect(stage1.beforeFontSize).toBeLessThan(24)
    expect(stage1.beforeFontSize).toBeLessThan(headingFontSize)
    expect(stage1.beforeContent).toBe('"#"')

    const cardBox = await card.boundingBox()
    const headingBox = await heading.boundingBox()
    const anchorBox = await anchor.boundingBox()
    expect(cardBox).not.toBeNull()
    expect(headingBox).not.toBeNull()
    expect(anchorBox).not.toBeNull()
    // Anchor sits to the left of the heading text and completely inside the card (zero clipping)
    expect(anchorBox!.x + anchorBox!.width).toBeLessThanOrEqual(headingBox!.x + 1)
    expect(anchorBox!.x).toBeGreaterThanOrEqual(cardBox!.x)

    // Stage 2: hovering the anchor directly brightens to accent color without underline
    await anchor.hover()
    await expect(anchor).toHaveCSS('opacity', '1')
    await expect(anchor).toHaveCSS('border-bottom-width', '0px')
    await expect(anchor).not.toHaveCSS('color', stage1.color)
    const stage2Color = await anchor.evaluate(el => getComputedStyle(el).color)

    // Stage 3: clicking copies URL to clipboard and shows green ✓ feedback even after pointer leaves
    const now = await page.evaluate(() => Date.now())
    await page.clock.pauseAt(now + 5_000)
    await anchor.click()
    await expect(anchor).toHaveClass(/\bis-copied\b/)
    await page.mouse.move(0, 0)

    await expect.poll(() => anchor.evaluate(el => getComputedStyle(el, '::before').content)).toBe('"✓"')
    await expect(anchor).not.toHaveCSS('color', stage2Color)
    await expect(anchor).toHaveCSS('color', 'rgb(24, 121, 78)')
    await expect(anchor).toHaveCSS('opacity', '1')
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('#a-vue-component-in-your-post')

    // Feedback clears after ~1.6s
    await page.clock.fastForward(1700)
    await page.clock.resume()
    await expect(anchor).not.toHaveClass(/\bis-copied\b/)
    await expect(anchor).toHaveCSS('opacity', '0')

    // Re-clicking the active anchor still copies and replays .is-copied
    await heading.hover()
    await expect(anchor).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
    await anchor.hover()
    await page.evaluate(() => navigator.clipboard.writeText('cleared'))
    await anchor.click()
    await expect(anchor).toHaveClass(/\bis-copied\b/)
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('#a-vue-component-in-your-post')
  })

  test('tablet and mobile switch to inline-right anchor without clipping and keep md padding continuous', async ({ page }) => {
    await page.goto('/posts/hello-valaxy', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    const card = page.locator('.yun-main .yun-card').first()
    const heading = page.locator('.markdown-body h2#a-vue-component-in-your-post')
    const anchor = heading.locator('> .header-anchor')
    const contentWrapper = card.locator('div[class*="md:px-10"]')

    // Tablet (820x800)
    await page.setViewportSize({ width: 820, height: 800 })
    await heading.scrollIntoViewIfNeeded()
    await expect(contentWrapper).toHaveCSS('padding-left', '40px')
    await expect(anchor).toHaveCSS('position', 'relative')

    const cardBox820 = await card.boundingBox()
    const headingBox820 = await heading.boundingBox()
    const anchorBox820 = await anchor.boundingBox()
    expect(cardBox820).not.toBeNull()
    expect(headingBox820).not.toBeNull()
    expect(anchorBox820).not.toBeNull()
    expect(anchorBox820!.x).toBeGreaterThan(headingBox820!.x)
    expect(anchorBox820!.x).toBeGreaterThanOrEqual(cardBox820!.x)
    expect(anchorBox820!.x + anchorBox820!.width).toBeLessThanOrEqual(cardBox820!.x + cardBox820!.width)

    // Mobile (390x844)
    await page.setViewportSize({ width: 390, height: 844 })
    await heading.scrollIntoViewIfNeeded()
    await expect(anchor).toHaveCSS('position', 'relative')

    const cardBox390 = await card.boundingBox()
    const headingBox390 = await heading.boundingBox()
    const anchorBox390 = await anchor.boundingBox()
    expect(cardBox390).not.toBeNull()
    expect(headingBox390).not.toBeNull()
    expect(anchorBox390).not.toBeNull()
    expect(anchorBox390!.x).toBeGreaterThan(headingBox390!.x)
    expect(anchorBox390!.x).toBeGreaterThanOrEqual(cardBox390!.x)
    expect(anchorBox390!.x + anchorBox390!.width).toBeLessThanOrEqual(cardBox390!.x + cardBox390!.width)
  })

  test('nested containers switch to inline-right on desktop and respect reduced motion', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/posts/hello-valaxy', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    await page.evaluate(() => {
      const body = document.querySelector('.markdown-body')
      if (!body)
        return
      const quote = document.createElement('blockquote')
      const h3 = document.createElement('h3')
      h3.id = 'nested-anchor-test'
      h3.textContent = 'Nested '
      const a = document.createElement('a')
      a.className = 'header-anchor'
      a.href = '#nested-anchor-test'
      a.textContent = '\u200B'
      h3.appendChild(a)
      quote.appendChild(h3)
      body.prepend(quote)
    })

    const nestedAnchor = page.locator('.markdown-body blockquote h3#nested-anchor-test > .header-anchor')
    await expect(nestedAnchor).toHaveCSS('position', 'relative')

    // Reduced motion disables idle translateX shift and copied pop animation
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const heading = page.locator('.markdown-body h2#a-vue-component-in-your-post')
    const anchor = heading.locator('> .header-anchor')
    await heading.scrollIntoViewIfNeeded()

    await expect(anchor).toHaveCSS('transform', 'none')
    await heading.hover()
    await anchor.hover()
    await anchor.click()
    await expect(anchor).toHaveClass(/\bis-copied\b/)

    const animationName = await anchor.evaluate(el => getComputedStyle(el, '::before').animationName)
    expect(animationName).toBe('none')
  })
})
