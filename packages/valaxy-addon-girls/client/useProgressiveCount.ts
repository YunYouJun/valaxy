import type { MaybeRefOrGetter } from 'vue'
import { computed, readonly, shallowRef, toValue, watch } from 'vue'

function normalizeCount(value: number, fallback: number) {
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : fallback
}

export function useProgressiveCount(
  total: MaybeRefOrGetter<number>,
  initialCount: MaybeRefOrGetter<number>,
  batchSize: MaybeRefOrGetter<number>,
) {
  const currentCount = shallowRef(0)

  const totalCount = computed(() => Math.max(0, Math.floor(toValue(total))))
  const normalizedInitialCount = computed(() => normalizeCount(toValue(initialCount), 24))
  const normalizedBatchSize = computed(() => normalizeCount(toValue(batchSize), 24))
  const remainingCount = computed(() => Math.max(0, totalCount.value - currentCount.value))
  const nextBatchCount = computed(() => Math.min(normalizedBatchSize.value, remainingCount.value))

  watch(
    [totalCount, normalizedInitialCount],
    ([nextTotal, nextInitialCount]) => {
      currentCount.value = Math.min(nextTotal, nextInitialCount)
    },
    { immediate: true },
  )

  function showMore() {
    currentCount.value = Math.min(
      totalCount.value,
      currentCount.value + normalizedBatchSize.value,
    )
  }

  return {
    nextBatchCount,
    remainingCount,
    showMore,
    visibleCount: readonly(currentCount),
  }
}
