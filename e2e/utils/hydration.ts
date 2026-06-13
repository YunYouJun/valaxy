import type { Page } from '@playwright/test'

/**
 * Wait until the Valaxy Vue app has finished mounting / hydrating.
 *
 * Prefer `page.goto(url, { waitUntil: 'domcontentloaded' })` followed by
 * `waitForHydration(page)` over `waitUntil: 'networkidle'`:
 *
 * 1. `networkidle` is unreliable for *readiness*. The client mount in
 *    `packages/valaxy/client/main.ts` is gated behind an async chain
 *    (`await import('@unhead/vue/client')` + `await router.isReady()`) before
 *    `app.mount('#app')` runs. With cached chunks there can be zero network
 *    requests, so `networkidle` may fire BEFORE that async mount resolves —
 *    meaning component `setup()` (and any window-level listeners they register,
 *    e.g. the Cmd/Ctrl+K `onKeyStroke` in `PressNavBarSearch.vue`) is not yet
 *    attached.
 * 2. `networkidle` is also *flaky*: against the Vite dev server, background
 *    activity (HMR, UnoCSS dev updates, the git-log addon's API calls, async
 *    DocSearch chunks) can keep the network busy so it never idles for 500ms,
 *    making `page.goto` itself time out. This is a documented Playwright
 *    anti-pattern.
 *
 * Vue's runtime-dom sets the `data-v-app` attribute on the mount container
 * synchronously right after `app.mount()` returns (for both client render and
 * hydration). Waiting for it is a deterministic "app is interactive" signal —
 * no arbitrary timeouts, no dependence on the network ever going quiet.
 */
export async function waitForHydration(page: Page, selector = '#app'): Promise<void> {
  await page.locator(`${selector}[data-v-app]`).waitFor({ state: 'attached' })
}
