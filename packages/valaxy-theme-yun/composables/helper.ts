import { isClient, useEventListener } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'

/**
 * fetch data from source, and random
 * @param source
 * @param random
 */
export function useRandomData<T>(source: string | T[], random = false) {
  const data = ref<T[]>()

  watch(() => source, async () => {
    let rawData: T[]
    if (typeof source === 'string') {
      if (!isClient)
        return
      rawData = (await fetch(source).then(res => res.json()) as T[]) || []
    }
    else { rawData = source }

    // Always use original order during initial render to avoid hydration mismatch.
    // Random sorting is deferred to onMounted (see below).
    data.value = rawData
  }, { immediate: true })

  // Apply random sorting only after hydration is complete
  if (random && isClient) {
    onMounted(() => {
      if (data.value) {
        data.value = data.value.toSorted(() => Math.random() - 0.5)
      }
    })
  }

  return {
    data,
  }
}

export function useHotKey(key: string, callback: () => void) {
  const isHotKeyActive = ref(false)

  function handleHotKey(event: KeyboardEvent) {
    if (event.key.toLowerCase() === key.toLowerCase() && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      callback()
    }
  }

  useEventListener('keydown', handleHotKey)

  return { isHotKeyActive }
}
