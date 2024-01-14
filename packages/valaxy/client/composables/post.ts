import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Post } from 'valaxy'
import { sortByDate } from '../utils'
import { useSiteStore } from '../stores'

export function usePostTitle(post: ComputedRef<Post>) {
  const { locale } = useI18n()
  return computed(() => {
    const lang = locale.value === 'zh-CN' ? 'zh' : locale.value
    return post.value[`title_${lang}`] || post.value.title
  })
}

/**
 * get all page in 'pages' folder
 */
export function usePageList() {
  return computed<Post[]>(() => {
    const excludePages = ['/:..all', '/:all(.*)*', '/', '/:path(.*)']
    const router = useRouter()
    const routes = router.getRoutes()
      .filter(i => i.name)
      .filter(i => i.meta)
      .filter(i => i.meta!.frontmatter)
      .filter(i => i.path && !excludePages.includes(i.path))
      .map((i) => {
        return Object.assign({ path: i.path, excerpt: i.meta!.excerpt }, i.meta!.frontmatter || {}) as Post
      })
    return routes
  })
}

/**
 * get post list in 'pages/posts' folder
 * todo: use vue provide/inject to global
 */
export function usePostList(params: {
  type?: string
} = {}) {
  const pageList = usePageList()
  return computed(() => {
    const routes = pageList.value
      .filter(i =>
        i.path?.startsWith('/posts')
        && !i.path?.endsWith('.html')
        && i.date
        && (!params.type || i.type === params.type)
        && (!i.hide || i.hide === 'index'), // hide `hide: all` posts
      )

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
