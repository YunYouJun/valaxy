import type { MaybeRefOrGetter } from 'vue'
import type { GirlEntry, GirlsSource } from '../types'
import { onBeforeUnmount, onMounted, readonly, shallowRef, toValue, watch } from 'vue'
import { fetchGirls, normalizeGirls, shuffleGirls } from './data'

export interface UseGirlsOptions {
  random?: MaybeRefOrGetter<boolean | undefined>
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}

export function useGirls(
  source: MaybeRefOrGetter<GirlsSource>,
  options: UseGirlsOptions = {},
) {
  const initialSource = toValue(source)
  const girls = shallowRef<GirlEntry[]>(
    typeof initialSource === 'string' ? [] : normalizeGirls(initialSource),
  )
  const isLoading = shallowRef(typeof initialSource === 'string')
  const error = shallowRef<Error | null>(null)
  let controller: AbortController | undefined
  let stopWatching: (() => void) | undefined

  function applyOrder(entries: GirlEntry[]) {
    return toValue(options.random) ? shuffleGirls(entries) : entries
  }

  async function load() {
    const currentSource = toValue(source)

    controller?.abort()
    controller = undefined
    error.value = null

    if (typeof currentSource !== 'string') {
      girls.value = applyOrder(normalizeGirls(currentSource))
      isLoading.value = false
      return
    }

    const requestController = new AbortController()
    controller = requestController
    isLoading.value = true

    try {
      girls.value = applyOrder(await fetchGirls(currentSource, {
        signal: requestController.signal,
      }))
    }
    catch (fetchError) {
      if (isAbortError(fetchError))
        return

      error.value = fetchError instanceof Error
        ? fetchError
        : new Error('Failed to load girls')
    }
    finally {
      if (controller === requestController) {
        controller = undefined
        isLoading.value = false
      }
    }
  }

  onMounted(() => {
    stopWatching = watch(
      [() => toValue(source), () => Boolean(toValue(options.random))],
      () => void load(),
      { immediate: true },
    )
  })

  onBeforeUnmount(() => {
    stopWatching?.()
    controller?.abort()
  })

  return {
    error: readonly(error),
    girls: readonly(girls),
    isLoading: readonly(isLoading),
    reload: load,
  }
}
