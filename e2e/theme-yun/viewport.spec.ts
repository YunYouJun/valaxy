import { expect, test } from '@playwright/test'
import { env } from '../env'

test('keeps the mobile profile visible if the entry script arrives after the fallback', async ({ page }) => {
  const viewport = { width: 412, height: 823 }
  await page.setViewportSize(viewport)
  await page.route('https://v1.hitokoto.cn/**', route => route.abort())
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (/hydration/i.test(message.text()))
      errors.push(message.text())
  })
  const entry = Promise.withResolvers<void>()
  await page.route('**/assets/index.*.js', async (route) => {
    await entry.promise
    await route.continue()
  })
  try {
    await page.goto(env['theme-yun'], { waitUntil: 'commit' })
    const prologue = page.locator('.yun-home-prologue')
    await expect(prologue.locator('#yun-banner-placeholder')).toBeAttached()
    const content = prologue.locator('.yun-home-prologue-content')
    const avatar = content.getByRole('img', { name: 'avatar' })
    const postsLink = content.locator('a[href="/posts/"]')
    await expect(avatar).toBeVisible()
    await expect.poll(() => avatar.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
    await expect(content.locator('.site-name')).toBeVisible()
    await expect(content.locator('.site-description')).toBeVisible()
    await expect(postsLink).toBeVisible()
    await expect(content).toHaveCSS('opacity', '1')
    await expect(content.locator('.yun-square')).toHaveCSS('opacity', '1')
    const navMenu = page.locator('.yun-nav-menu')
    await expect(navMenu).toBeVisible()
    await expect(navMenu).toHaveCSS('opacity', '1')
    expect(await prologue.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(viewport.height - 1)

    const firstPost = page.locator('.post-title-link').first()
    const getPostTop = () => firstPost.evaluate(el => el.getBoundingClientRect().top)
    const initialPostTop = await getPostTop()
    const initialAvatar = await avatar.elementHandle()
    entry.resolve()

    await expect(content).toHaveClass(/is-intro-complete/)
    await expect(prologue.locator('#yun-banner .banner-char-container')).not.toBeAttached()
    await expect(content).toHaveCSS('opacity', '1')
    await expect(navMenu).toHaveCSS('opacity', '1')
    await expect(navMenu).not.toHaveClass(/is-home-intro-/)
    expect(await initialAvatar!.evaluate(el => el === document.querySelector('.yun-home-prologue-content img[alt="avatar"]'))).toBe(true)
    expect(Math.abs(await getPostTop() - initialPostTop)).toBeLessThan(3)
    await postsLink.click()
    await expect(page).toHaveURL(/\/posts\/?$/)
    expect(errors).toEqual([])
  }
  finally {
    entry.resolve()
  }
})

for (const width of [412, 769, 1350]) {
  test(`reveals the profile at ${width}px only after the centered intro retracts`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 412 ? 823 : 940 })
    await page.goto(env['theme-yun'], { waitUntil: 'commit' })

    const content = page.locator('.yun-home-prologue-content')
    const navMenu = page.locator('.yun-nav-menu')
    const banner = page.locator('#yun-banner')
    const title = banner.locator('.banner-char-container')
    await expect(title).toBeVisible()
    await expect(content).toHaveCSS('visibility', 'hidden')
    await expect(navMenu).toHaveCSS('visibility', 'hidden')
    const centerOffsets = await banner.evaluate((el) => {
      const centerX = (element: Element) => {
        const { x, width } = element.getBoundingClientRect()
        return x + width / 2
      }
      return Array.from(el.querySelectorAll('.banner-line, .banner-char-container'), part => Math.abs(centerX(el) - centerX(part)))
    })
    expect(centerOffsets).toHaveLength(3)
    for (const offset of centerOffsets)
      expect(offset).toBeLessThan(1)

    // Let the title fade and lower line retract while the upper line is paused.
    await page.waitForFunction(() => {
      const topLine = document.querySelector('#yun-banner .vertical-line-top.exit')?.getAnimations()[0]
      const titleFade = document.querySelector('#yun-banner .yun-banner-intro-title.is-intro-exiting')?.getAnimations()[0]
      if (!topLine || !titleFade)
        return false
      topLine.pause()
      topLine.currentTime = 0
      return true
    })
    await banner.locator('.vertical-line-bottom.exit').evaluate(async (line) => {
      await Promise.all(line.getAnimations().map(animation => animation.finished))
    })
    await expect(title).toHaveCSS('opacity', '0')
    await expect(content).toHaveCSS('visibility', 'hidden')
    await expect(navMenu).toHaveCSS('visibility', 'hidden')

    await navMenu.evaluate((el) => {
      const store = globalThis as { __navDropStarted?: boolean }
      store.__navDropStarted = false
      el.addEventListener('animationstart', (event) => {
        if (event.target === el && (event as AnimationEvent).animationName === 'yun-nav-drop-in')
          store.__navDropStarted = true
      })
    })
    await banner.locator('.vertical-line-top.exit').evaluate((line) => {
      line.getAnimations().forEach(animation => animation.finish())
    })
    await expect(title).not.toBeAttached()
    await expect.poll(() => page.evaluate(() => (globalThis as { __navDropStarted?: boolean }).__navDropStarted)).toBe(true)
    await expect(content).toHaveCSS('opacity', '1')
    await expect(content.getByRole('img', { name: 'avatar' })).toBeVisible()
    await expect(content.locator('.site-description')).toBeVisible()
    await expect.poll(() =>
      navMenu.evaluate(el => el.getAnimations().every(animation => animation.playState === 'finished')),
    ).toBe(true)
    await expect(navMenu).not.toHaveClass(/is-home-intro-/)
    await expect(navMenu).toHaveCSS('visibility', 'visible')
    await expect(navMenu).toHaveCSS('opacity', '1')
    await expect(navMenu).toHaveCSS('transform', 'none')
  })
}

test('keeps the desktop profile visible if the entry script arrives after the fallback', async ({ page }) => {
  await page.setViewportSize({ width: 1350, height: 940 })
  const entry = Promise.withResolvers<void>()
  await page.route('**/assets/index.*.js', async (route) => {
    await entry.promise
    await route.continue()
  })

  try {
    await page.goto(env['theme-yun'], { waitUntil: 'commit' })
    const content = page.locator('.yun-home-prologue-content')
    const navMenu = page.locator('.yun-nav-menu')
    await expect(page.locator('#yun-banner-placeholder')).toBeAttached()
    await expect(content.locator('.site-name')).toBeVisible()
    await expect(content).toHaveCSS('opacity', '1')
    await expect(navMenu).toBeVisible()
    await expect(navMenu).toHaveCSS('opacity', '1')

    entry.resolve()
    await expect(content).toHaveClass(/is-intro-complete/)
    await expect(page.locator('#yun-banner .banner-char-container')).not.toBeAttached()
    await expect(content).toHaveCSS('opacity', '1')
    await expect(navMenu).toHaveCSS('opacity', '1')
    await expect(navMenu).not.toHaveClass(/is-home-intro-/)
  }
  finally {
    entry.resolve()
  }
})

test('shows the desktop profile directly with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 1350, height: 940 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(env['theme-yun'], { waitUntil: 'commit' })
  const content = page.locator('.yun-home-prologue-content')
  const navMenu = page.locator('.yun-nav-menu')
  await expect(content.locator('.site-description')).toBeVisible()
  await expect(content).toHaveClass(/is-intro-complete/)
  await expect(page.locator('#yun-banner .banner-char-container')).not.toBeAttached()
  await expect(navMenu).toBeVisible()
  await expect(navMenu).toHaveCSS('opacity', '1')
})

test('keeps the desktop navbar visible when returning home via SPA navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1350, height: 940 })
  await page.route(/fonts\.(googleapis|loli)\.com/, route => route.fulfill({ contentType: 'text/css', body: '' }))
  await page.route('https://v1.hitokoto.cn/**', route => route.fulfill({
    json: { hitokoto: 'Stable quote.', from_who: 'Valaxy', from: 'E2E' },
  }))
  await page.goto(env['theme-yun'], { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('#yun-banner.is-intro-playing') === null && document.querySelector('.yun-home-prologue-content.is-intro-complete') !== null)

  const navMenu = page.locator('.yun-nav-menu')
  await expect.poll(() =>
    navMenu.evaluate(el => el.getAnimations().every(animation => animation.playState === 'finished')),
  ).toBe(true)
  await expect(navMenu).toHaveCSS('visibility', 'visible')
  await expect(navMenu).toHaveCSS('opacity', '1')

  await navMenu.locator('a[href="/posts/"]').click()
  await expect(page).toHaveURL(/\/posts\/?$/)
  await expect(navMenu).toHaveCSS('visibility', 'visible')
  await expect(navMenu).toHaveCSS('opacity', '1')

  await page.evaluate(() => {
    const store = globalThis as { __navHiddenDuringReturn?: boolean }
    store.__navHiddenDuringReturn = false
    const el = document.querySelector('.yun-nav-menu')!
    const observer = new MutationObserver(() => {
      const style = getComputedStyle(el)
      if (style.visibility === 'hidden' || Number.parseFloat(style.opacity) < 0.99 || el.classList.contains('is-home-intro-playing'))
        store.__navHiddenDuringReturn = true
    })
    observer.observe(el, { attributes: true, attributeFilter: ['class'] })
  })

  await navMenu.locator('a[href="/"]').click()
  await expect(page).toHaveURL(new RegExp(`^${env['theme-yun']}/?$`))
  await expect(page.locator('#yun-banner .banner-char-container')).toBeVisible()
  await expect(navMenu).toHaveCSS('visibility', 'visible')
  await expect(navMenu).toHaveCSS('opacity', '1')
  await expect(navMenu).not.toHaveClass(/is-home-intro-/)
  expect(await page.evaluate(() => (globalThis as { __navHiddenDuringReturn?: boolean }).__navHiddenDuringReturn)).toBe(false)
})

test('restores the home banner height when a hidden iframe becomes visible', async ({ page }) => {
  const hostUrl = `${env['theme-yun-dev']}/__hidden-iframe-host`
  await page.route(hostUrl, route => route.fulfill({
    contentType: 'text/html',
    body: '<style>body{margin:0}.preview{display:none;height:800px}.preview iframe{width:100%;height:100%;border:0}</style><div class="preview"><iframe src="/"></iframe></div>',
  }))
  await page.goto(hostUrl)

  const frame = page.frameLocator('iframe')
  await expect(frame.locator('#yun-banner')).toBeAttached()
  await page.locator('.preview').evaluate((element) => {
    (element as HTMLElement).style.display = 'block'
  })

  await expect.poll(() => frame.locator('#yun-banner').evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThan(700)
  await expect.poll(() => frame.locator('html').evaluate(element => Number.parseFloat((element as HTMLElement).style.getPropertyValue('--vh')))).toBeGreaterThan(7)

  await page.locator('.preview').evaluate((element) => {
    (element as HTMLElement).style.height = '600px'
  })
  await expect.poll(() => frame.locator('#yun-banner').evaluate(element => element.getBoundingClientRect().height)).toBeLessThan(700)
  await expect.poll(() => frame.locator('html').evaluate(element => Number.parseFloat((element as HTMLElement).style.getPropertyValue('--vh')))).toBe(6)
})
