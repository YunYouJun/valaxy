import { describe, expect, it } from 'vitest'
import { nextTick, shallowRef } from 'vue'
import { useProgressiveCount } from '../client'

describe('useProgressiveCount', () => {
  it('reveals a 108-item collection in bounded batches', () => {
    const total = shallowRef(108)
    const { nextBatchCount, remainingCount, showMore, visibleCount } = useProgressiveCount(
      total,
      24,
      24,
    )

    expect(visibleCount.value).toBe(24)
    expect(remainingCount.value).toBe(84)
    expect(nextBatchCount.value).toBe(24)

    showMore()
    showMore()
    showMore()

    expect(visibleCount.value).toBe(96)
    expect(remainingCount.value).toBe(12)
    expect(nextBatchCount.value).toBe(12)

    showMore()
    expect(visibleCount.value).toBe(108)
    expect(remainingCount.value).toBe(0)
  })

  it('resets safely when the source collection changes', async () => {
    const total = shallowRef(108)
    const { remainingCount, showMore, visibleCount } = useProgressiveCount(total, 24, 36)

    showMore()
    expect(visibleCount.value).toBe(60)

    total.value = 10
    await nextTick()

    expect(visibleCount.value).toBe(10)
    expect(remainingCount.value).toBe(0)
  })
})
