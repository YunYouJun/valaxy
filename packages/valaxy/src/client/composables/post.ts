import { sortByDate } from 'valaxy'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * get post list
 * todo: use vue provide/inject to global
 * @param params
 * @returns
 */
export function usePostList(params: {
  type?: string
} = {}) {
  const router = useRouter()
  return computed(() => {
    const routes = router.getRoutes()
      .filter(i => i.path.startsWith('/posts') && i.meta.frontmatter && i.meta.frontmatter.date)
      .filter(i => !i.path.endsWith('.html'))
      .filter(i => !params.type || i.meta.frontmatter.type === params.type)
      .map((i) => {
        return Object.assign({ path: i.path, excerpt: i.meta.excerpt }, i.meta.frontmatter)
      })

    sortByDate(routes)

    return routes
  })
}

/**
 * get prev and next post
 * @param path
 * @returns
 */
export function usePrevNext(path?: string) {
  const route = useRoute()
  const p = computed(() => path || route.path)
  const routes = usePostList()

  const index = computed(() => {
    let order = -1
    routes.value.find((item, i) => {
      if (item.path === p.value) {
        order = i
        return true
      }
      return false
    })
    return order
  })

  const prev = computed(() => index.value - 1 >= 0 ? routes.value[index.value - 1] : null)
  const next = computed(() => index.value + 1 < routes.value.length ? routes.value[index.value + 1] : null)

  return [prev, next]
}
