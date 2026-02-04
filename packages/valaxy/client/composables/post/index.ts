import type { Post, SiteConfig } from 'valaxy'
import type { ComputedRef } from 'vue'
import { orderByMeta, useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouterStore } from '../../stores'
import { tObject } from '../../utils'

export * from './usePagination'
export * from './usePrevNext'

export function usePostTitle(post: ComputedRef<Post>) {
  const { locale } = useI18n()
  return computed(() => {
    return tObject(post.value.title || '', locale.value)
  })
}

/**
 * get all page in 'pages' folder
 */
export function usePageList() {
  const routerStore = useRouterStore()
  const router = routerStore.router

  return computed<Post[]>(() => {
    const excludePages = ['/:..all', '/:all(.*)*', '/', '/:path(.*)']
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
 * Pure function to filter and sort posts from page list
 * Can be used in both composables and stores without inject() issues
 */
export function filterAndSortPosts(
  pages: Post[],
  siteConfig: SiteConfig,
  params: { type?: string } = {},
): Post[] {
  // Filter posts
  const routes = pages
    .filter(i =>
      i.path?.startsWith('/posts')
      && !i.path?.endsWith('.html')
      && i.date
      && (!params.type || i.type === params.type)
      && (!i.hide || i.hide === 'index'), // hide `hide: all` posts
    )

  function sortBySiteConfigOrderBy(posts: Post[]) {
    const orderBy = siteConfig.orderBy
    return orderByMeta(posts, orderBy)
  }

  /**
   * 置顶
   */
  const topPosts = sortBySiteConfigOrderBy(routes.filter(i => i.top)).sort((a, b) => b.top! - a.top!)
  const otherPosts = sortBySiteConfigOrderBy(routes.filter(i => !i.top))

  return topPosts.concat(otherPosts)
}

/**
 * get post list in 'pages/posts' folder
 * todo: use vue provide/inject to global
 */
export function usePostList(params: {
  type?: string
} = {}) {
  const siteConfig = useSiteConfig()
  const pageList = usePageList()
  return computed(() => {
    return filterAndSortPosts(pageList.value, siteConfig.value, params)
  })
}
