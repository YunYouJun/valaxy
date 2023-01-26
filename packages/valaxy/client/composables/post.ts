import type { Ref } from 'vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Post } from '../..'
import { sortByDate } from '../utils'
import { useSiteStore } from '../stores'

export const usePostTitle = (post: Ref<Post>) => {
  const { locale } = useI18n()
  return computed(() => {
    const lang = locale.value === 'zh-CN' ? 'zh' : locale.value
    return post.value[`title_${lang}`] || post.value.title
  })
}

/**
 * get all page in 'pages' folder
 * @returns
 */
export function usePageList() {
  const router = useRouter()
  return computed<Post[]>(() => {
    const excludePages = ['/:..all', '/:all(.*)*', '/']
    const routes = router.getRoutes()
      .filter(i => i.meta.frontmatter)
      .filter(i => i.path && !excludePages.includes(i.path))
      .map((i) => {
        return Object.assign({ path: i.path, excerpt: i.meta.excerpt }, i.meta.frontmatter)
      })
    return routes
  })
}

/**
 * get post list in 'pages/posts' folder
 * todo: use vue provide/inject to global
 * @param params
 * @returns
 */
export function usePostList(params: {
  type?: string
} = {}) {
  const pageList = usePageList()
  return computed(() => {
    const routes = pageList.value
      .filter(i => i.path?.startsWith('/posts'))
      .filter(i => !i.path?.endsWith('.html'))
      .filter(i => i.date)
      .filter(i => !params.type || i.type === params.type)

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
