import { expect, test } from '@playwright/test'
import { env } from '../env'

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
