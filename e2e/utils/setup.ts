import { test } from '@playwright/test'
import { consola } from 'consola'
import { abortUrls } from '../config'
import { env } from '../env'

export function setup(name?: 'theme-yun') {
  if (name && name === 'theme-yun') {
    test.use({
      baseURL: env['theme-yun'],
    })
  }

  test.beforeEach('Global network intercept for all tests', async ({ context }) => {
    await context.route('**/*', (route) => {
      const url = route.request().url()

      // 检查 URL 是否需要被拦截
      const shouldAbort = abortUrls.some(abortUrl => url.includes(abortUrl))

      if (shouldAbort) {
        return route.abort()
      }

      // 继续正常请求
      return route.continue()
    })

    consola.debug(`🔒 Global network intercept activated for context`)
  })
}
