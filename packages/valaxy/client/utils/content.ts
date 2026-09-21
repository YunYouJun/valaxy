import { onMounted, onUnmounted } from 'vue'

// eslint-disable-next-line import/no-mutable-exports
export let contentUpdatedCallbacks: (() => any)[] = []

/**
 * Register callback that is called every time the markdown content is updated
 * in the DOM.
 */
export function onContentUpdated(fn: () => any) {
  // These callbacks operate on the DOM. Register only after mounting: SSR
  // never unmounts components, so registering during setup retains every
  // rendered page (including its router) in this module-level array.
  onMounted(() => contentUpdatedCallbacks.push(fn))
  onUnmounted(() => {
    contentUpdatedCallbacks = contentUpdatedCallbacks.filter(f => f !== fn)
  })
}

export const runCbs = () => contentUpdatedCallbacks.forEach(fn => fn())
export const runContentUpdated = runCbs
