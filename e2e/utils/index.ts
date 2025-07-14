import { test } from '@playwright/test'
import { abortUrls } from '../config'

export function commonBeforeEach() {
  test.beforeEach(async ({ page }) => {
    await page.route('**/*', (route) => {
      const url = route.request().url()
      if (abortUrls.some(abortUrl => url.includes(abortUrl))) {
        return route.abort()
      }
      return route.continue()
    })
  })
}
