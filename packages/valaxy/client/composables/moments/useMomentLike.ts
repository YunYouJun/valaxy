import { computed, onMounted, ref } from 'vue'

export const MOMENT_LIKES_STORAGE_KEY = 'valaxy:moments:likes'

export interface MomentLikeStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export function readMomentLiked(storage: MomentLikeStorage, path: string) {
  try {
    const data = JSON.parse(storage.getItem(MOMENT_LIKES_STORAGE_KEY) || '{}')
    return Boolean(data && typeof data === 'object' && data[path])
  }
  catch {
    return false
  }
}

export function writeMomentLiked(storage: MomentLikeStorage, path: string, liked: boolean) {
  let data: Record<string, boolean> = {}
  try {
    const parsed = JSON.parse(storage.getItem(MOMENT_LIKES_STORAGE_KEY) || '{}')
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
      data = parsed
  }
  catch {}

  if (liked)
    data[path] = true
  else
    delete data[path]

  storage.setItem(MOMENT_LIKES_STORAGE_KEY, JSON.stringify(data))
}

export function useMomentLike(path: string) {
  const hydrated = ref(false)
  const liked = ref(false)
  const count = computed(() => liked.value ? 1 : 0)

  onMounted(() => {
    liked.value = readMomentLiked(window.localStorage, path)
    hydrated.value = true
  })

  function toggle() {
    if (!hydrated.value)
      return

    liked.value = !liked.value
    writeMomentLiked(window.localStorage, path, liked.value)
  }

  return { count, hydrated, liked, toggle }
}
