import { expect, test } from '@playwright/test'
import { env } from '../env'

test('shows the mobile home content before the banner animation can start', async ({ page }) => {
  const viewport = { width: 412, height: 823 }
  await page.setViewportSize(viewport)
  await page.route('https://v1.hitokoto.cn/**', route => route.abort())
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (/hydration/i.test(message.text()))
      errors.push(message.text())
  })
  let releaseEntry!: () => void
  const entryGate = new Promise<void>((resolve) => {
    releaseEntry = resolve
  })
  await page.route('**/assets/index.*.js', async (route) => {
    await entryGate
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
    expect(await prologue.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(viewport.height - 1)

    const firstPost = page.locator('.post-title-link').first()
    const getPostTop = () => firstPost.evaluate(el => el.getBoundingClientRect().top)
    const initialPostTop = await getPostTop()
    const initialAvatar = await avatar.elementHandle()
    releaseEntry()

    const animation = prologue.locator('#yun-banner .banner-char-container')
    await expect(animation).toBeVisible()
    const artBox = await animation.boundingBox()
    const linkBox = await postsLink.boundingBox()
    expect(artBox!.x + artBox!.width).toBeLessThanOrEqual(linkBox!.x)
    expect(await initialAvatar!.evaluate(el => el === document.querySelector('.yun-home-prologue-content img[alt="avatar"]'))).toBe(true)
    expect(Math.abs(await getPostTop() - initialPostTop)).toBeLessThan(3)
    await postsLink.click()
    await expect(page).toHaveURL(/\/posts\/?$/)
    expect(errors).toEqual([])
  }
  finally { releaseEntry() }
})

for (const width of [769, 1350]) {
  test(`reveals the desktop profile at ${width}px only after the centered intro retracts`, async ({ page }) => {
    await page.setViewportSize({ width, height: 940 })
    await page.goto(env['theme-yun'], { waitUntil: 'commit' })

    const content = page.locator('.yun-home-prologue-content')
    const banner = page.locator('#yun-banner')
    const title = banner.locator('.banner-char-container')
    await expect(title).toBeVisible()
    await expect(content).toHaveCSS('visibility', 'hidden')
    const centerOffset = await banner.evaluate((el) => {
      const bounds = el.getBoundingClientRect()
      const line = el.querySelector('.vertical-line-top')!.getBoundingClientRect()
      return Math.abs((bounds.left + bounds.right) / 2 - (line.left + line.right) / 2)
    })
    expect(centerOffset).toBeLessThan(1)

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

    await banner.locator('.vertical-line-top.exit').evaluate((line) => {
      line.getAnimations().forEach(animation => animation.finish())
    })
    await expect(title).not.toBeAttached()
    await expect(content).toHaveCSS('opacity', '1')
    await expect(content.getByRole('img', { name: 'avatar' })).toBeVisible()
    await expect(content.locator('.site-description')).toBeVisible()
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
    await expect(page.locator('#yun-banner-placeholder')).toBeAttached()
    await expect(content.locator('.site-name')).toBeVisible()
    await expect(content).toHaveCSS('opacity', '1')

    entry.resolve()
    await expect(content).toHaveClass(/is-intro-complete/)
    await expect(page.locator('#yun-banner .banner-char-container')).not.toBeAttached()
    await expect(content).toHaveCSS('opacity', '1')
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
  await expect(content.locator('.site-description')).toBeVisible()
  await expect(content).toHaveClass(/is-intro-complete/)
  await expect(page.locator('#yun-banner .banner-char-container')).not.toBeAttached()
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
