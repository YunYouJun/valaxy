import { expect, test } from '@playwright/test'
import { waitForHydration } from '../utils/hydration'

const targetPath = '/guide/getting-started'
const entryChunk = /\/assets\/index\.[\w-]+\.js$/
const targetChunk = /\/assets\/getting-started\.[\w-]+\.js$/
const previousSuffix = '-previous.js'

const scenarios = [
  { title: 'opens the target document after a route chunk 404', back: false, persistent: false },
  { title: 'recovers a failed browser back navigation', back: true, persistent: false },
  { title: 'does not loop when the route chunk is still missing', back: false, persistent: true },
]

for (const { title, back, persistent } of scenarios) {
  test(title, async ({ page }) => {
    const documentRequests: string[] = []
    page.on('request', (request) => {
      if (request.isNavigationRequest() && request.resourceType() === 'document')
        documentRequests.push(new URL(request.url()).pathname)
    })

    let previousDeployment = true
    // The open tab's entry uses an obsolete route chunk URL.
    await page.route(entryChunk, async (route) => {
      if (!previousDeployment)
        return route.continue()
      const response = await route.fetch()
      const body = (await response.text()).replace(/getting-started\.[\w-]+\.js/g, chunk => chunk.replace(/\.js$/, previousSuffix))
      await route.fulfill({ response, body, headers: { ...response.headers(), 'cache-control': 'no-store' } })
    })
    const chunkRequests = new Set<string>()
    await page.route(targetChunk, (route) => {
      const path = new URL(route.request().url()).pathname
      chunkRequests.add(path)
      const previousChunk = path.endsWith(previousSuffix)
      return previousChunk || persistent ? route.fulfill({ status: 404 }) : route.continue()
    })

    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)
    previousDeployment = false
    const targetDocument = page.waitForResponse(
      response => response.request().resourceType() === 'document' && new URL(response.url()).pathname === targetPath,
      { timeout: 10_000 },
    )
    const startupError = persistent
      ? page.waitForEvent(
          'pageerror',
          error => new URL(page.url()).pathname === targetPath && /dynamically imported module|importing a module script failed/i.test(error.message),
        )
      : undefined
    // Simulate a history entry left by an older document, without loading its route chunk.
    const navigate = back
      ? page.evaluate((target) => {
          const current = history.state
          history.replaceState({ ...current, position: current.position - 1 }, '', target)
          history.pushState(current, '', '/')
          history.back()
        }, `${targetPath}#Getting%20Started`)
      : page.locator('.press-get-started').click()
    const [htmlResponse] = await Promise.all([
      targetDocument,
      startupError,
      navigate,
    ])

    expect(htmlResponse.ok()).toBe(true)
    await expect(page.getByRole('heading', { level: 1, name: 'Getting Started', exact: true })).toBeVisible()
    if (persistent) {
      // Give an unintended reload scheduled by the error handler time to issue a request.
      await expect(page.waitForRequest(
        request => request.isNavigationRequest() && request.resourceType() === 'document',
        { timeout: 500 },
      )).rejects.toThrow('Timeout')
    }
    else {
      await waitForHydration(page)
    }
    if (back)
      await expect(page).toHaveURL(`${targetPath}#Getting%20Started`)
    expect([...chunkRequests].some(path => path.endsWith(previousSuffix))).toBe(true)
    expect([...chunkRequests].some(path => !path.endsWith(previousSuffix))).toBe(true)
    expect(documentRequests).toEqual(['/', targetPath])
  })
}
