import { onUnmounted } from 'vue'

export let contentUpdatedCallbacks: (() => any)[] = []

/**
 * Register callback that is called every time the markdown content is updated
 * in the DOM.
 */
export function onContentUpdated(fn: () => any) {
  contentUpdatedCallbacks.push(fn)
  onUnmounted(() => {
    contentUpdatedCallbacks = contentUpdatedCallbacks.filter(f => f !== fn)
  })
}

export const runCbs = () => contentUpdatedCallbacks.forEach(fn => fn())
export const runContentUpdated = runCbs
