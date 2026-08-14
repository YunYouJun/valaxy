import type { MaybeRefOrGetter } from 'vue'
import { computed, readonly, shallowRef, toValue, watch } from 'vue'

function normalizeCount(value: number, fallback: number) {
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : fallback
}

export function useMomentsProgressiveCount(
  total: MaybeRefOrGetter<number>,
  initialCount: MaybeRefOrGetter<number>,
  batchSize: MaybeRefOrGetter<number>,
) {
  const visibleCount = shallowRef(0)
  const totalCount = computed(() => Math.max(0, Math.floor(toValue(total))))
  const normalizedInitialCount = computed(() => normalizeCount(toValue(initialCount), 10))
  const normalizedBatchSize = computed(() => normalizeCount(toValue(batchSize), 10))
  const remainingCount = computed(() => Math.max(0, totalCount.value - visibleCount.value))

  watch(
    [totalCount, normalizedInitialCount],
    ([total, initial]) => visibleCount.value = Math.min(total, initial),
    { immediate: true },
  )

  function showMore() {
    visibleCount.value = Math.min(totalCount.value, visibleCount.value + normalizedBatchSize.value)
  }

  return {
    remainingCount,
    showMore,
    visibleCount: readonly(visibleCount),
  }
}
