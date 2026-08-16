import type { MaybeRefOrGetter } from 'vue'
import { onMounted, readonly, shallowRef, toValue, watch } from 'vue'
import { fetchMomentLikeCounts, readLikedMomentIds, submitMomentLike, writeLikedMomentIds } from './likes'

export interface UseMomentsLikeOptions {
  enabled: MaybeRefOrGetter<boolean>
  endpoint: MaybeRefOrGetter<string>
  momentIds: MaybeRefOrGetter<readonly string[]>
}

export function useMomentsLike(options: UseMomentsLikeOptions) {
  const counts = shallowRef<Record<string, number>>({})
  const likedIds = shallowRef<Set<string>>(new Set())
  const pendingIds = shallowRef<Set<string>>(new Set())
  let confirmedLikedIds = new Set<string>()
  let mounted = false
  let refreshVersion = 0

  function replaceSet(target: typeof likedIds, value: Set<string>) {
    target.value = value
  }

  async function refresh() {
    const version = ++refreshVersion
    if (!mounted || !toValue(options.enabled))
      return

    const endpoint = toValue(options.endpoint).trim()
    const ids = toValue(options.momentIds)
    if (!endpoint || !ids.length) {
      counts.value = {}
      return
    }

    try {
      const nextCounts = await fetchMomentLikeCounts(endpoint, ids)
      if (version === refreshVersion)
        counts.value = nextCounts
    }
    catch {
      // The moments page remains usable when the optional likes API is unavailable.
    }
  }

  async function toggle(momentId: string) {
    if (!mounted || !toValue(options.enabled) || pendingIds.value.has(momentId))
      return

    const endpoint = toValue(options.endpoint).trim()
    if (!endpoint)
      return

    const wasLiked = likedIds.value.has(momentId)
    const previousCount = counts.value[momentId] ?? 0
    const action = wasLiked ? 'unlike' : 'like'

    refreshVersion++
    replaceSet(pendingIds, new Set(pendingIds.value).add(momentId))

    const optimisticLikedIds = new Set(likedIds.value)
    if (wasLiked)
      optimisticLikedIds.delete(momentId)
    else
      optimisticLikedIds.add(momentId)
    replaceSet(likedIds, optimisticLikedIds)
    counts.value = {
      ...counts.value,
      [momentId]: Math.max(0, previousCount + (wasLiked ? -1 : 1)),
    }

    try {
      const count = await submitMomentLike(endpoint, momentId, action)
      counts.value = { ...counts.value, [momentId]: count }
      confirmedLikedIds = new Set(confirmedLikedIds)
      if (wasLiked)
        confirmedLikedIds.delete(momentId)
      else
        confirmedLikedIds.add(momentId)
      writeLikedMomentIds(window.localStorage, confirmedLikedIds)
    }
    catch {
      const rolledBackLikedIds = new Set(likedIds.value)
      if (wasLiked)
        rolledBackLikedIds.add(momentId)
      else
        rolledBackLikedIds.delete(momentId)
      replaceSet(likedIds, rolledBackLikedIds)
      counts.value = { ...counts.value, [momentId]: previousCount }
    }
    finally {
      const nextPendingIds = new Set(pendingIds.value)
      nextPendingIds.delete(momentId)
      replaceSet(pendingIds, nextPendingIds)
    }
  }

  watch(
    () => [
      toValue(options.enabled),
      toValue(options.endpoint),
      toValue(options.momentIds).join('\u0000'),
    ] as const,
    () => void refresh(),
  )

  onMounted(() => {
    mounted = true
    confirmedLikedIds = readLikedMomentIds(window.localStorage)
    likedIds.value = new Set(confirmedLikedIds)
    void refresh()
  })

  return {
    counts: readonly(counts),
    isLiked: (momentId: string) => likedIds.value.has(momentId),
    isPending: (momentId: string) => pendingIds.value.has(momentId),
    toggle,
  }
}
