import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteStore } from '../../stores'

/**
 * get prev and next post
 * @param path
 */
export function usePrevNext(path?: string) {
  const route = useRoute()
  const p = computed(() => path || route.path)
  const site = useSiteStore()

  const index = computed(() => {
    let order = -1
    site.postList.find((item, i) => {
      if (item.path === p.value) {
        order = i
        return true
      }
      return false
    })
    return order
  })

  const prev = computed(() => index.value - 1 >= 0 ? site.postList[index.value - 1] : null)
  const next = computed(() => index.value + 1 < site.postList.length ? site.postList[index.value + 1] : null)

  return [prev, next]
}
