import { describe, expect, it } from 'vitest'
import { nextTick, shallowRef } from 'vue'
import { useMomentsProgressiveCount } from '../client/useProgressiveCount'

describe('useMomentsProgressiveCount', () => {
  it('shows moments in bounded batches', () => {
    const { remainingCount, showMore, visibleCount } = useMomentsProgressiveCount(26, 10, 10)

    expect(visibleCount.value).toBe(10)
    showMore()
    expect(visibleCount.value).toBe(20)
    showMore()
    expect(visibleCount.value).toBe(26)
    expect(remainingCount.value).toBe(0)
  })

  it('resets when the source changes', async () => {
    const total = shallowRef(30)
    const { showMore, visibleCount } = useMomentsProgressiveCount(total, 10, 10)
    showMore()
    total.value = 4
    await nextTick()
    expect(visibleCount.value).toBe(4)
  })
})
