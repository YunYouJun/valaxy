import type { Page } from '@playwright/test'

/**
 * Wait until the Valaxy Vue app has finished mounting / hydrating.
 *
 * `page.goto(..., { waitUntil: 'networkidle' })` is NOT enough: the client
 * mount in `packages/valaxy/client/main.ts` is gated behind an async chain
 * (`await import('@unhead/vue/client')` + `await router.isReady()`) before
 * `app.mount('#app')` runs. With cached chunks there can be zero network
 * requests, so `networkidle` may fire BEFORE that async mount resolves —
 * meaning component `setup()` (and any window-level listeners they register,
 * e.g. the Cmd/Ctrl+K `onKeyStroke` in `PressNavBarSearch.vue`) is not yet
 * attached.
 *
 * Vue's runtime-dom sets the `data-v-app` attribute on the mount container
 * synchronously right after `app.mount()` returns (for both client render and
 * hydration). Waiting for it is a deterministic "app is interactive" signal —
 * no arbitrary timeouts.
 */
export async function waitForHydration(page: Page, selector = '#app'): Promise<void> {
  await page.locator(`${selector}[data-v-app]`).waitFor({ state: 'attached' })
}
