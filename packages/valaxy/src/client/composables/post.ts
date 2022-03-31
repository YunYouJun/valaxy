import { sortByDate } from 'valaxy'
import type { StyleValue } from 'vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeConfig } from '../../core/config'

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

    /**
     * 置顶
     */
    const topPosts = sortByDate(routes.filter(i => i.top)).sort((a, b) => b.top! - a.top!)
    const otherPosts = sortByDate(routes.filter(i => !i.top))

    return topPosts.concat(otherPosts)
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

/**
 * get type card property
 * todo: test reactive
 */
export function usePostProperty(type = 'link') {
  const themeConfig = useThemeConfig()

  if (!(type in themeConfig.value.types))
    type = 'link'

  const color = themeConfig.value.types[type].color
  const icon = themeConfig.value.types[type].icon

  const styles = computed(() => {
    return {
      '--card-c-primary': type && color,
    } as StyleValue
  })

  return {
    color,
    icon,
    styles,
  }
}
