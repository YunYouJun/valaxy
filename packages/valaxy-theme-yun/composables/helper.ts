import { isClient, useEventListener } from '@vueuse/core'
import { onMounted, ref } from 'vue'

/**
 * fetch data from source, and random
 * @param source
 * @param random
 */
export function useRandomData<T>(source: string | T[], random = false) {
  const data = ref<T[]>()

  async function fetchData(url: string) {
    if (!isClient)
      return

    try {
      const res = await fetch(url)
      if (!res.ok)
        return
      const rawData = (await res.json() as T[]) || []
      data.value = random ? rawData.toSorted(() => Math.random() - 0.5) : rawData
    }
    catch {
      // Network or JSON parse failure — leave data unchanged
    }
  }

  if (typeof source === 'string') {
    // Defer URL fetching to onMounted to prevent hydration mismatch.
    // During SSG, the fetch is skipped (data stays undefined → empty list).
    // If the fetch runs during hydration via an immediate watcher, data would
    // update before hydration completes, causing a DOM mismatch error.
    //
    // Note: `source` is a plain parameter (not reactive), so no watch is needed.
    // Callers pass `props.links` / `props.girls` which are stable for the
    // component's lifetime.
    if (isClient) {
      onMounted(() => fetchData(source))
    }
  }
  else {
    // For static array data, set the initial value directly so SSR and client
    // render the same content (original order, no random).
    // Random sorting is deferred to onMounted below.
    data.value = source as T[]

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
