import type { MaybeRefOrGetter } from 'vue'
import { onBeforeUnmount, onMounted, readonly, shallowRef, toValue, watch } from 'vue'
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
  let refreshController: AbortController | undefined
  const mutationRevisions = new Map<string, number>()

  function replaceSet(target: typeof likedIds, value: Set<string>) {
    target.value = value
  }

  function markMutation(momentId: string) {
    mutationRevisions.set(momentId, (mutationRevisions.get(momentId) ?? 0) + 1)
  }

  async function refresh() {
    const version = ++refreshVersion
    refreshController?.abort()
    refreshController = undefined
    if (!mounted || !toValue(options.enabled))
      return

    const endpoint = toValue(options.endpoint).trim()
    const ids = [...toValue(options.momentIds)]
    if (!endpoint || !ids.length) {
      counts.value = {}
      return
    }

    const controller = new AbortController()
    const revisions = new Map(ids.map(id => [id, mutationRevisions.get(id) ?? 0]))
    refreshController = controller

    try {
      const nextCounts = await fetchMomentLikeCounts(endpoint, ids, fetch, controller.signal)
      if (version !== refreshVersion || controller.signal.aborted || !mounted)
        return

      const mergedCounts = { ...counts.value }
      for (const [momentId, count] of Object.entries(nextCounts)) {
        const revisionUnchanged = (mutationRevisions.get(momentId) ?? 0) === revisions.get(momentId)
        if (revisionUnchanged && !pendingIds.value.has(momentId))
          mergedCounts[momentId] = count
      }
      counts.value = mergedCounts
    }
    catch {
      // The moments page remains usable when the optional likes API is unavailable.
    }
    finally {
      if (refreshController === controller)
        refreshController = undefined
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

    markMutation(momentId)
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
      markMutation(momentId)
      counts.value = { ...counts.value, [momentId]: count }
      confirmedLikedIds = new Set(confirmedLikedIds)
      if (wasLiked)
        confirmedLikedIds.delete(momentId)
      else
        confirmedLikedIds.add(momentId)
      writeLikedMomentIds(window.localStorage, confirmedLikedIds)
    }
    catch {
      markMutation(momentId)
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

  onBeforeUnmount(() => {
    mounted = false
    refreshVersion++
    refreshController?.abort()
    refreshController = undefined
  })

  return {
    counts: readonly(counts),
    isLiked: (momentId: string) => likedIds.value.has(momentId),
    isPending: (momentId: string) => pendingIds.value.has(momentId),
    toggle,
  }
}
