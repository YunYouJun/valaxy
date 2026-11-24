import process from 'node:process'
import { expect, test } from '@playwright/test'
import { env } from '../env'
import { waitForHydration } from '../utils/hydration'

test.use({ baseURL: process.env.YUN_SEARCH_URL || env['theme-yun'] })

for (const mode of ['light', 'dark', 'mobile'] as const) {
  test(`Fuse search keeps focus contained and fades only overflowing results (${mode})`, async ({ page }) => {
    await page.setViewportSize(mode === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 900 })
    await page.emulateMedia({ colorScheme: mode === 'light' ? 'light' : 'dark', reducedMotion: 'reduce' })
    await page.route(/fonts\.(googleapis|loli)\.com/, route => route.abort())
    await page.route('**/valaxy-fuse-list.json', route => route.fulfill({
      json: Array.from({ length: 24 }, (_, i) => ({
        title: `Yun article ${i} ${i === 0 ? 'OnlyOne' : ''}`,
        link: `/posts/search-fixture-${i}`,
        excerpt: 'A concise excerpt for testing search result readability and scrolling.',
      })),
    }))
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)
    const prologue = page.locator('.yun-home-prologue-content')
    if (await prologue.count() > 0)
      await expect(prologue).toHaveClass(/is-intro-complete/)
    const trigger = page.locator('.yun-search-btn')
    await expect(trigger).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    const triggerTransitions = await trigger.evaluate((el) => {
      const lens = el.querySelector('.yun-search-icon-lens')!
      const handle = el.querySelector('.yun-search-icon-handle')!
      const cross = el.querySelector('.yun-search-icon-cross')!
      return {
        lens: getComputedStyle(lens).transitionDuration,
        handle: getComputedStyle(handle).transitionDuration,
        cross: getComputedStyle(cross).transitionDuration,
      }
    })
    expect(triggerTransitions.lens).toBe('0s')
    expect(triggerTransitions.handle).toBe('0s')
    expect(triggerTransitions.cross).toBe('0s')
    await page.evaluate(() => {
      const store = globalThis as { __reducedSearchTransitions?: string[] }
      store.__reducedSearchTransitions = []
      document.addEventListener('transitionrun', (event) => {
        const target = event.target
        if (!(target instanceof Element))
          return
        const cls = typeof target.className === 'string' ? target.className : (target.className as SVGAnimatedString).baseVal
        if (cls.includes('yun-search-icon'))
          store.__reducedSearchTransitions?.push(`${cls}:${event.propertyName}`)
      })
    })
    const triggerBox = await trigger.boundingBox()
    expect(triggerBox).not.toBeNull()
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const dialog = page.getByRole('dialog')
    await expect(page.locator('#valaxy-teleports').getByRole('dialog')).toBeVisible()
    await expect(dialog).toHaveAccessibleName(/搜索文章|Search articles/)
    await expect(dialog).toHaveAccessibleDescription(/方向键|arrow keys/)
    const dismiss = dialog.locator('.yun-search-dismiss')
    await expect(dismiss).toBeVisible()
    await expect(dismiss).toHaveCSS('border-radius', '10px')
    const dismissIcon = dismiss.locator('.yun-search-icon.is-open')
    await expect(dismissIcon).toBeVisible()
    const iconMetrics = await dismiss.evaluate((el) => {
      const btnRect = el.getBoundingClientRect()
      const svg = el.querySelector('.yun-search-icon')!
      const svgRect = svg.getBoundingClientRect()
      const lens = svg.querySelector('.yun-search-icon-lens')!
      const handle = svg.querySelector('.yun-search-icon-handle') as SVGLineElement
      const cross = svg.querySelector('.yun-search-icon-cross') as SVGLineElement
      const measureLineCenter = (line: SVGLineElement) => {
        const ctm = line.getScreenCTM()!
        const p1 = new DOMPoint(line.x1.baseVal.value, line.y1.baseVal.value).matrixTransform(ctm)
        const p2 = new DOMPoint(line.x2.baseVal.value, line.y2.baseVal.value).matrixTransform(ctm)
        return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
      }
      const handleCenter = measureLineCenter(handle)
      const crossCenter = measureLineCenter(cross)
      const btnCenterX = btnRect.left + btnRect.width / 2
      const btnCenterY = btnRect.top + btnRect.height / 2
      return {
        svgWidth: svgRect.width,
        svgHeight: svgRect.height,
        lensOpacity: getComputedStyle(lens).opacity,
        crossOpacity: getComputedStyle(cross).opacity,
        lensTransitionDuration: getComputedStyle(lens).transitionDuration,
        handleTransitionDuration: getComputedStyle(handle).transitionDuration,
        crossTransitionDuration: getComputedStyle(cross).transitionDuration,
        handleCenterOffsetX: Math.abs(handleCenter.x - btnCenterX),
        handleCenterOffsetY: Math.abs(handleCenter.y - btnCenterY),
        crossCenterOffsetX: Math.abs(crossCenter.x - btnCenterX),
        crossCenterOffsetY: Math.abs(crossCenter.y - btnCenterY),
      }
    })
    expect(Math.abs(iconMetrics.svgWidth - 20)).toBeLessThanOrEqual(0.5)
    expect(Math.abs(iconMetrics.svgHeight - 20)).toBeLessThanOrEqual(0.5)
    expect(iconMetrics.lensOpacity).toBe('0')
    expect(iconMetrics.crossOpacity).toBe('1')
    expect(iconMetrics.lensTransitionDuration).toBe('0s')
    expect(iconMetrics.handleTransitionDuration).toBe('0s')
    expect(iconMetrics.crossTransitionDuration).toBe('0s')
    expect(iconMetrics.handleCenterOffsetX).toBeLessThanOrEqual(0.5)
    expect(iconMetrics.handleCenterOffsetY).toBeLessThanOrEqual(0.5)
    expect(iconMetrics.crossCenterOffsetX).toBeLessThanOrEqual(0.5)
    expect(iconMetrics.crossCenterOffsetY).toBeLessThanOrEqual(0.5)
    const dismissBox = await dismiss.boundingBox()
    expect(dismissBox).not.toBeNull()
    expect(Math.abs(dismissBox!.x - triggerBox!.x)).toBeLessThanOrEqual(1)
    expect(Math.abs(dismissBox!.y - triggerBox!.y)).toBeLessThanOrEqual(1)
    expect(Math.abs(dismissBox!.width - triggerBox!.width)).toBeLessThanOrEqual(1)
    expect(Math.abs(dismissBox!.height - triggerBox!.height)).toBeLessThanOrEqual(1)
    if (mode !== 'mobile') {
      await dismiss.hover()
      await expect(dismiss).not.toHaveCSS('background-color', 'rgba(0, 120, 231, 0.08)')
      await expect(dismiss).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    }
    const input = dialog.getByRole('searchbox')
    await expect(input).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(dismiss).toBeFocused()
    await expect(dismiss).toHaveCSS('outline-style', 'solid')
    await expect(dismiss).toHaveCSS('outline-offset', '1px')
    await input.focus()
    await input.fill('Yun')
    const results = dialog.locator('.yun-search-results')
    await expect(dialog.locator('.yun-search-result')).toHaveCount(24)
    await expect.poll(() => results.evaluate(el => el.style.getPropertyValue('--yun-search-fade-bottom'))).toBe('56px')
    await expect(results).not.toHaveCSS('mask-image', 'none')
    await results.evaluate(el => el.scrollTo(0, el.scrollHeight))
    await expect.poll(() => results.evaluate(el => el.style.getPropertyValue('--yun-search-fade-bottom'))).toBe('0px')
    await expect(dialog.locator('.yun-search-result').last()).toBeInViewport()
    await input.fill('OnlyOne')
    await expect(dialog.locator('.yun-search-result')).toHaveCount(1)
    await expect.poll(() => results.evaluate(el => el.style.getPropertyValue('--yun-search-fade-bottom'))).toBe('0px')
    await page.keyboard.press('ArrowDown')
    await expect(dialog.locator('.is-selected')).toBeFocused()
    await input.focus()
    await page.keyboard.press('Shift+Tab')
    expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true)
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toBeFocused()
    const reducedTransitions = await page.evaluate(() => (globalThis as { __reducedSearchTransitions?: string[] }).__reducedSearchTransitions ?? [])
    expect(reducedTransitions).toEqual([])
    expect(errors).toEqual([])
  })
}

test('aligns search close icon with hamburger close icon and morphs smoothly', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.route(/fonts\.(googleapis|loli)\.com/, route => route.abort())
  await page.route('**/valaxy-fuse-list.json', route => route.fulfill({ json: [] }))

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForHydration(page)

  const prologue = page.locator('.yun-home-prologue-content')
  if (await prologue.count() > 0)
    await expect(prologue).toHaveClass(/is-intro-complete/)

  await expect.poll(() =>
    page.locator('.yun-nav-menu').evaluate(el => el.getAnimations().every(a => a.playState === 'finished')),
  ).toBe(true)

  const trigger = page.locator('.yun-search-btn')
  const hamburger = page.locator('.yun-nav-menu .vt-hamburger.yun-action-btn')
  await expect(trigger).toBeVisible()
  await expect(hamburger).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  const initialIcon = await trigger.evaluate((el) => {
    const svg = el.querySelector('.yun-search-icon')!
    const svgRect = svg.getBoundingClientRect()
    const lens = svg.querySelector('.yun-search-icon-lens')!
    const handle = svg.querySelector('.yun-search-icon-handle')!
    const cross = svg.querySelector('.yun-search-icon-cross')!
    const handleRect = handle.getBoundingClientRect()
    return {
      isOpen: svg.classList.contains('is-open'),
      lensOpacity: getComputedStyle(lens).opacity,
      crossOpacity: getComputedStyle(cross).opacity,
      lensDurations: getComputedStyle(lens).transitionDuration.split(',').map(v => Number.parseFloat(v)),
      handleDurations: getComputedStyle(handle).transitionDuration.split(',').map(v => Number.parseFloat(v)),
      crossDurations: getComputedStyle(cross).transitionDuration.split(',').map(v => Number.parseFloat(v)),
      handleOffsetX: (handleRect.left + handleRect.width / 2) - (svgRect.left + svgRect.width / 2),
      handleOffsetY: (handleRect.top + handleRect.height / 2) - (svgRect.top + svgRect.height / 2),
    }
  })

  expect(initialIcon.isOpen).toBe(false)
  expect(initialIcon.lensOpacity).toBe('1')
  expect(initialIcon.crossOpacity).toBe('0')
  expect(initialIcon.lensDurations.every(d => d > 0)).toBe(true)
  expect(initialIcon.handleDurations.every(d => d > 0)).toBe(true)
  expect(initialIcon.crossDurations.every(d => d > 0)).toBe(true)
  expect(initialIcon.handleOffsetX).toBeGreaterThan(1)
  expect(initialIcon.handleOffsetY).toBeGreaterThan(1)

  await hamburger.click()
  await expect(hamburger).toHaveClass(/is-active/)
  await expect.poll(() =>
    hamburger.evaluate(el => el.querySelectorAll('span').length > 0 && [...el.querySelectorAll('span')].every(s => s.getAnimations().every(a => a.playState === 'finished'))),
  ).toBe(true)

  const hamburgerMetrics = await hamburger.evaluate((el) => {
    const btnRect = el.getBoundingClientRect()
    const btnCenterX = btnRect.left + btnRect.width / 2
    const btnCenterY = btnRect.top + btnRect.height / 2
    const container = el.querySelector('.vt-hamburger-container')!
    const topBar = el.querySelector('.vt-hamburger-top')!
    const bottomBar = el.querySelector('.vt-hamburger-bottom')!
    const topRect = topBar.getBoundingClientRect()
    const bottomRect = bottomBar.getBoundingClientRect()
    const barStyle = getComputedStyle(topBar)
    const containerTransform = getComputedStyle(container).transform
    const scaleMatch = containerTransform.match(/^matrix\(([^,]+),/)
    const scale = scaleMatch ? Number.parseFloat(scaleMatch[1]) : 1
    const barW = Number.parseFloat(barStyle.width)
    const barH = Number.parseFloat(barStyle.height)
    const visualSpan = ((barW - barH) / Math.SQRT2 + barH) * scale
    return {
      width: btnRect.width,
      height: btnRect.height,
      top: btnRect.top,
      visualSpan,
      topCenterOffsetX: Math.abs((topRect.left + topRect.width / 2) - btnCenterX),
      topCenterOffsetY: Math.abs((topRect.top + topRect.height / 2) - btnCenterY),
      bottomCenterOffsetX: Math.abs((bottomRect.left + bottomRect.width / 2) - btnCenterX),
      bottomCenterOffsetY: Math.abs((bottomRect.top + bottomRect.height / 2) - btnCenterY),
    }
  })

  expect(hamburgerMetrics.topCenterOffsetX).toBeLessThanOrEqual(0.5)
  expect(hamburgerMetrics.topCenterOffsetY).toBeLessThanOrEqual(0.5)
  expect(hamburgerMetrics.bottomCenterOffsetX).toBeLessThanOrEqual(0.5)
  expect(hamburgerMetrics.bottomCenterOffsetY).toBeLessThanOrEqual(0.5)

  await hamburger.click()
  await expect(hamburger).not.toHaveClass(/is-active/)

  // Warm the lazy Fuse dialog chunk before measuring the synchronous entry morph.
  await trigger.click()
  const dialog = page.getByRole('dialog')
  const dismiss = dialog.locator('.yun-search-dismiss')
  await expect(dismiss).toBeVisible()
  await expect.poll(() =>
    dismiss.evaluate(el => [...el.querySelectorAll('.yun-search-icon *')].every(p => p.getAnimations().every(a => a.playState === 'finished'))),
  ).toBe(true)
  await dismiss.click()
  await expect(dialog).not.toBeVisible()
  await expect.poll(() =>
    trigger.evaluate(el => [...el.querySelectorAll('.yun-search-icon *')].every(p => p.getAnimations().every(a => a.playState === 'finished'))),
  ).toBe(true)

  await page.evaluate(() => {
    const store = globalThis as {
      __searchMorphEvents?: Array<{ cls: string, prop: string, inDialog: boolean, inTrigger: boolean }>
    }
    store.__searchMorphEvents = []
    document.addEventListener('transitionrun', (event) => {
      const target = event.target
      if (!(target instanceof Element))
        return
      const cls = typeof target.className === 'string' ? target.className : (target.className as SVGAnimatedString).baseVal
      if (!cls.includes('yun-search-icon'))
        return
      store.__searchMorphEvents?.push({
        cls,
        prop: event.propertyName,
        inDialog: Boolean(target.closest('.yun-fuse-dialog')),
        inTrigger: Boolean(target.closest('.yun-search-btn')),
      })
    })
  })

  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(dismiss).toBeVisible()
  await expect(dismiss.locator('.yun-search-icon.is-open.is-appear')).toBeVisible()

  await expect.poll(() =>
    dismiss.evaluate((el) => {
      const svg = el.querySelector('.yun-search-icon')
      if (!svg)
        return false
      const parts = [...svg.querySelectorAll('circle, line')]
      return parts.every(p => p.getAnimations().every(a => a.playState === 'finished'))
        && getComputedStyle(svg.querySelector('.yun-search-icon-lens')!).opacity === '0'
        && getComputedStyle(svg.querySelector('.yun-search-icon-cross')!).opacity === '1'
    }),
  ).toBe(true)

  const openEvents = await page.evaluate(() => {
    const store = globalThis as {
      __searchMorphEvents?: Array<{ cls: string, prop: string, inDialog: boolean, inTrigger: boolean }>
    }
    const events = store.__searchMorphEvents ?? []
    store.__searchMorphEvents = []
    return events
  })
  for (const part of ['yun-search-icon-lens', 'yun-search-icon-handle', 'yun-search-icon-cross'])
    expect(openEvents.some(e => e.inDialog && e.cls.includes(part))).toBe(true)

  const dismissMetrics = await dismiss.evaluate((el) => {
    const btnRect = el.getBoundingClientRect()
    const btnCenterX = btnRect.left + btnRect.width / 2
    const btnCenterY = btnRect.top + btnRect.height / 2
    const svg = el.querySelector('.yun-search-icon')!
    const handle = svg.querySelector('.yun-search-icon-handle') as SVGLineElement
    const cross = svg.querySelector('.yun-search-icon-cross') as SVGLineElement
    const measureSvgLine = (line: SVGLineElement) => {
      const ctm = line.getScreenCTM()!
      const p1 = new DOMPoint(line.x1.baseVal.value, line.y1.baseVal.value).matrixTransform(ctm)
      const p2 = new DOMPoint(line.x2.baseVal.value, line.y2.baseVal.value).matrixTransform(ctm)
      const strokeWidth = Number.parseFloat(getComputedStyle(line).strokeWidth)
      const scaleX = Math.hypot(ctm.a, ctm.b)
      const scaleY = Math.hypot(ctm.c, ctm.d)
      return {
        centerX: (p1.x + p2.x) / 2,
        centerY: (p1.y + p2.y) / 2,
        visualSpanX: Math.abs(p2.x - p1.x) + strokeWidth * scaleX,
        visualSpanY: Math.abs(p2.y - p1.y) + strokeWidth * scaleY,
      }
    }
    const handleMetrics = measureSvgLine(handle)
    const crossMetrics = measureSvgLine(cross)
    return {
      width: btnRect.width,
      height: btnRect.height,
      top: btnRect.top,
      visualSpanX: handleMetrics.visualSpanX,
      visualSpanY: handleMetrics.visualSpanY,
      crossVisualSpanX: crossMetrics.visualSpanX,
      crossVisualSpanY: crossMetrics.visualSpanY,
      handleCenterOffsetX: Math.abs(handleMetrics.centerX - btnCenterX),
      handleCenterOffsetY: Math.abs(handleMetrics.centerY - btnCenterY),
      crossCenterOffsetX: Math.abs(crossMetrics.centerX - btnCenterX),
      crossCenterOffsetY: Math.abs(crossMetrics.centerY - btnCenterY),
    }
  })

  expect(Math.abs(dismissMetrics.width - hamburgerMetrics.width)).toBeLessThanOrEqual(1)
  expect(Math.abs(dismissMetrics.height - hamburgerMetrics.height)).toBeLessThanOrEqual(1)
  expect(Math.abs(dismissMetrics.top - hamburgerMetrics.top)).toBeLessThanOrEqual(1)
  expect(Math.abs(dismissMetrics.visualSpanX - hamburgerMetrics.visualSpan)).toBeLessThanOrEqual(0.5)
  expect(Math.abs(dismissMetrics.visualSpanY - hamburgerMetrics.visualSpan)).toBeLessThanOrEqual(0.5)
  expect(Math.abs(dismissMetrics.crossVisualSpanX - hamburgerMetrics.visualSpan)).toBeLessThanOrEqual(0.5)
  expect(Math.abs(dismissMetrics.crossVisualSpanY - hamburgerMetrics.visualSpan)).toBeLessThanOrEqual(0.5)
  expect(dismissMetrics.handleCenterOffsetX).toBeLessThanOrEqual(0.5)
  expect(dismissMetrics.handleCenterOffsetY).toBeLessThanOrEqual(0.5)
  expect(dismissMetrics.crossCenterOffsetX).toBeLessThanOrEqual(0.5)
  expect(dismissMetrics.crossCenterOffsetY).toBeLessThanOrEqual(0.5)

  await dismiss.click()
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger.locator('.yun-search-icon')).not.toHaveClass(/is-open/)
  await expect(trigger).toBeFocused()
  await expect.poll(() =>
    trigger.evaluate((el) => {
      const svg = el.querySelector('.yun-search-icon')!
      const parts = [...svg.querySelectorAll('circle, line')]
      return parts.every(p => p.getAnimations().every(a => a.playState === 'finished'))
        && getComputedStyle(svg.querySelector('.yun-search-icon-lens')!).opacity === '1'
        && getComputedStyle(svg.querySelector('.yun-search-icon-cross')!).opacity === '0'
    }),
  ).toBe(true)

  const closeEvents = await page.evaluate(() => (globalThis as {
    __searchMorphEvents?: Array<{ cls: string, prop: string, inDialog: boolean, inTrigger: boolean }>
  }).__searchMorphEvents ?? [])
  for (const part of ['yun-search-icon-lens', 'yun-search-icon-handle', 'yun-search-icon-cross'])
    expect(closeEvents.some(e => e.inTrigger && e.cls.includes(part))).toBe(true)
})

test('does not replay the search icon morph when Fuse loads slowly', async ({ page }) => {
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route(/fonts\.(googleapis|loli)\.com/, route => route.abort())
  await page.route(/\/YunFuseSearch\.[^/]+\.js$/, async (route) => {
    await pending
    await route.continue()
  })
  await page.route('**/valaxy-fuse-list.json', route => route.fulfill({
    json: [
      { title: 'Current Home Page', link: '/', excerpt: 'Same route focus check' },
    ],
  }))

  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)
    const prologue = page.locator('.yun-home-prologue-content')
    if (await prologue.count() > 0)
      await expect(prologue).toHaveClass(/is-intro-complete/)

    const trigger = page.locator('.yun-search-btn')
    await expect(trigger).toBeVisible()
    await trigger.click()

    await expect.poll(() =>
      trigger.evaluate((el) => {
        const icon = el.querySelector('.yun-search-icon.is-open')
        if (!icon)
          return false
        const parts = [...icon.querySelectorAll('circle, line')]
        return parts.every(p => p.getAnimations().every(a => a.playState !== 'running'))
          && getComputedStyle(icon.querySelector('.yun-search-icon-lens')!).opacity === '0'
          && getComputedStyle(icon.querySelector('.yun-search-icon-cross')!).opacity === '1'
      }),
    ).toBe(true)

    // Move focus while Fuse chunk is still pending to verify opener was captured before download.
    await page.locator('.yun-toggle-dark').focus()

    await page.evaluate(() => {
      const store = globalThis as { __delayedDialogTransitions?: string[] }
      store.__delayedDialogTransitions = []
      document.addEventListener('transitionrun', (event) => {
        const target = event.target
        if (!(target instanceof Element) || !target.closest('.yun-fuse-dialog'))
          return
        const cls = typeof target.className === 'string' ? target.className : (target.className as SVGAnimatedString).baseVal
        if (cls.includes('yun-search-icon'))
          store.__delayedDialogTransitions?.push(`${cls}:${event.propertyName}`)
      })
    })

    release()
    const dialog = page.getByRole('dialog')
    const dismiss = dialog.locator('.yun-search-dismiss')
    await expect(dismiss).toBeVisible()
    const dismissIcon = dismiss.locator('.yun-search-icon.is-open')
    await expect(dismissIcon).toBeVisible()
    await expect(dismissIcon).not.toHaveClass(/is-appear/)

    const state = await dismissIcon.evaluate(el => ({
      lensOpacity: getComputedStyle(el.querySelector('.yun-search-icon-lens')!).opacity,
      crossOpacity: getComputedStyle(el.querySelector('.yun-search-icon-cross')!).opacity,
    }))
    expect(state.lensOpacity).toBe('0')
    expect(state.crossOpacity).toBe('1')
    const delayedTransitions = await page.evaluate(() => (globalThis as { __delayedDialogTransitions?: string[] }).__delayedDialogTransitions ?? [])
    expect(delayedTransitions).toEqual([])

    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toBeFocused()

    // Selecting a result for the current route stays on the same page and restores focus.
    await trigger.click()
    const input = dialog.getByRole('searchbox')
    await expect(input).toBeFocused()
    await input.fill('Current Home')
    const sameRouteResult = dialog.locator('.yun-search-result').first()
    await expect(sameRouteResult).toBeVisible()
    await sameRouteResult.click()
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toBeFocused()
  }
  finally {
    release()
  }
})
