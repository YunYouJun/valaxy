import { expect, test } from '@playwright/test'
import { env } from '../env'
import { setup } from '../utils'
import { waitForHydration } from '../utils/hydration'

setup('theme-yun')

test.describe('Theme Yun', () => {
  test('banner', async ({ page }) => {
    await page.goto('/')
    // refresh to trigger animation
    await page.reload()
    // In nimbo mode, .char-box elements are transient (removed after ~1s animation).
    // Wait directly for .char-box to appear instead of just the banner container.
    await page.waitForSelector('.char-box', { timeout: 10000 })
    await expect(page.locator('.char-box')).toHaveCount(6)
    await expect(page.locator('.char-box').nth(0)).toHaveText('云')
  })

  // new version deprecated
  // test('sidebar', async ({ page }) => {
  //   await expect(page.locator('.sidebar')).toContainText('Valaxy Theme Yun')
  // })

  test('post list', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.post-title-link').nth(0)).toHaveText('Hello, Valaxy!')
  })

  test('post tag hover colors are stable in dev and build', async ({ page }) => {
    await page.route('https://v1.hitokoto.cn/**', route => route.fulfill({
      json: { hitokoto: 'A stable quote for the hover test.', from_who: 'Valaxy', from: 'E2E' },
    }))

    for (const [mode, baseURL] of [
      ['dev', env['theme-yun-dev']],
      ['build', env['theme-yun']],
    ] as const) {
      await test.step(mode, async () => {
        await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
        await waitForHydration(page)
        await expect(page.locator('.say-content')).toHaveText('A stable quote for the hover test.')

        const tag = page.locator('.post-tags .post-tag').first()
        const linkColor = await page.locator('.yun-nav-menu a[aria-current="page"]').evaluate(el => getComputedStyle(el).color)
        await tag.hover()
        await expect(tag).toHaveCSS('color', linkColor)

        await page.goto(`${baseURL}/tags/`, { waitUntil: 'domcontentloaded' })
        await waitForHydration(page)

        const layoutTag = page.locator('.post-tag').first()
        const primaryColor = await layoutTag.evaluate((el) => {
          const probe = document.createElement('span')
          probe.style.color = 'var(--va-c-primary)'
          el.append(probe)
          const color = getComputedStyle(probe).color
          probe.remove()
          return color
        })
        await layoutTag.hover()

        await expect(layoutTag).toHaveCSS('color', primaryColor)
      })
    }
  })

  test('post card keeps decorative and empty areas clickable', async ({ page }) => {
    await page.goto('/')

    // The theme allows custom link cursors, but the card must still fall back to
    // the native pointer when the optional CSS variable is not configured.
    await page.addStyleTag({
      content: `
        :root { --cursor-pointer: initial !important; }
        a { cursor: revert !important; }
      `,
    })

    const card = page.locator('.post-card-wrapper').first()
    await card.scrollIntoViewIfNeeded()
    const expectedHref = await card.locator('.post-card-overlay').getAttribute('href')
    const targets = [
      card.locator('.post-card-body'),
      card.locator('.yun-card-actions'),
    ]

    for (const target of targets) {
      const box = await target.boundingBox()
      expect(box).not.toBeNull()

      const point = {
        x: box!.x + box!.width / 2,
        y: box!.y + box!.height - 2,
      }
      await page.mouse.move(point.x, point.y)

      const hit = await page.evaluate(({ x, y }) => {
        const element = document.elementFromPoint(x, y)
        const link = element?.closest('a')

        return {
          cursor: element ? getComputedStyle(element).cursor : '',
          href: link?.getAttribute('href') ?? null,
        }
      }, point)

      expect(hit.cursor).toBe('pointer')
      expect(hit.href).toBe(expectedHref)
    }
  })

  test('enter post', async ({ page }) => {
    await page.goto('/')
    await page.click('.post-title-link')
    await page.waitForURL('/posts/hello-valaxy')
    await expect(page.locator('h1')).toHaveText('Hello, Valaxy!')
  })

  test('comment', async ({ page }) => {
    await page.goto('/about')
    await expect(page.locator('.comment')).toHaveCount(1)
  })

  test('search', async ({ page }) => {
    // NOTE: networkidle does NOT guarantee hydration is complete — the client
    // mount in main.ts runs after an async chain. This test is safe because it
    // clicks a button (Playwright auto-waits for actionability); keyboard-driven
    // tests must use `waitForHydration` instead. See e2e/utils/hydration.ts.
    await page.goto('/', { waitUntil: 'networkidle' })
    const searchBtn = page.locator('.yun-search-btn')
    await searchBtn.waitFor({ state: 'visible' })
    await searchBtn.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('searchbox')).toBeFocused()
    await dialog.getByRole('button', { name: /关闭搜索|Close search/ }).click()
    await expect(dialog).not.toBeVisible()
    await expect(searchBtn).toBeFocused()
  })
})
