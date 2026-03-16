import { isClient, useEventListener } from '@vueuse/core'
import { ref, watch } from 'vue'

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

    // During SSR, always use original order to avoid hydration mismatch
    // Random sorting will be applied on the client side
    data.value = (random && isClient) ? rawData.toSorted(() => Math.random() - 0.5) : rawData
  }, { immediate: true })

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
