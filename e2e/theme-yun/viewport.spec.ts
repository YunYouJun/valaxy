import { expect, test } from '@playwright/test'
import { env } from '../env'

test('shows the mobile home content before the banner animation can start', async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 823 })
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
    await expect(content.locator('.site-name')).toBeVisible()
    await expect(postsLink).toBeVisible()
    await expect(content).toHaveCSS('opacity', '1')
    expect(await prologue.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(822)

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
