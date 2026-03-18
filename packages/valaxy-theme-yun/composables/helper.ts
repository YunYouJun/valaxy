import { isClient, useEventListener } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'

/**
 * fetch data from source, and random
 * @param source
 * @param random
 */
export function useRandomData<T>(source: string | T[], random = false) {
  const data = ref<T[]>()

  async function fetchData() {
    let rawData: T[]
    if (typeof source === 'string') {
      if (!isClient)
        return
      rawData = (await fetch(source).then(res => res.json()) as T[]) || []
    }
    else { rawData = source }

    if (random && isClient)
      rawData = rawData.toSorted(() => Math.random() - 0.5)

    data.value = rawData
  }

  if (typeof source === 'string') {
    // Defer URL fetching to onMounted to prevent hydration mismatch.
    // During SSG, the fetch is skipped (data stays undefined → empty list).
    // If the fetch runs during hydration via an immediate watcher, data would
    // update before hydration completes, causing a DOM mismatch error.
    if (isClient) {
      onMounted(() => {
        fetchData()
        watch(() => source, fetchData)
      })
    }
  }
  else {
    // For static array data, use immediate watch so SSR and client
    // render the same content (original order, no random).
    // Random sorting is deferred to onMounted below.
    watch(() => source, () => {
      data.value = source as T[]
    }, { immediate: true })

    // Apply random sorting only after hydration is complete
    if (random && isClient) {
      onMounted(() => {
        if (data.value) {
          data.value = data.value.toSorted(() => Math.random() - 0.5)
        }
      })
    }
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
