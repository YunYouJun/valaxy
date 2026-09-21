import { onUnmounted } from 'vue'

// eslint-disable-next-line import/no-mutable-exports
export let contentUpdatedCallbacks: (() => any)[] = []

/**
 * Register callback that is called every time the markdown content is updated
 * in the DOM.
 */
export function onContentUpdated(fn: () => any) {
  // SSR never unmounts components, so this module-level array would retain
  // every rendered page and its router. In the browser, register during setup
  // so parent listeners exist when child content first mounts.
  if (import.meta.env.SSR)
    return
  contentUpdatedCallbacks.push(fn)
  onUnmounted(() => {
    contentUpdatedCallbacks = contentUpdatedCallbacks.filter(f => f !== fn)
  })
}

export const runCbs = () => contentUpdatedCallbacks.forEach(fn => fn())
export const runContentUpdated = runCbs
