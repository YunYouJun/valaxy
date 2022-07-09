import type { Ref } from 'vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Post } from 'valaxy/types'
import { sortByDate } from '../utils'

export const usePostTitle = (post: Ref<Post>) => {
  const { locale } = useI18n()
  return computed(() => {
    const lang = locale.value === 'zh-CN' ? 'zh' : locale.value
    return post.value[`title_${lang}`] || post.value.title
  })
}

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
 * get all page
 * @returns
 */
export function usePageList() {
  const router = useRouter()
  return computed(() => {
    const routes = router.getRoutes()
      .map((i) => {
        return Object.assign({ path: i.path, excerpt: i.meta.excerpt }, i.meta.frontmatter)
      })
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
