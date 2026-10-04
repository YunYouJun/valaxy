import type { Post, SiteConfig } from '../../../types'
import { orderByMeta } from '../../utils/time'

/**
 * Pure function to filter and sort posts from page list
 * Can be used in both composables and stores without inject() issues
 */
export function filterAndSortPosts(
  pages: Post[],
  siteConfig: SiteConfig,
  params: { type?: string, pathPrefix?: string } = {},
): Post[] {
  const pathPrefix = `${(params.pathPrefix || '/posts').replace(/\/$/, '')}/`

  // Filter posts
  const routes = pages
    .filter(i =>
      i.path?.startsWith(pathPrefix)
      && !i.path?.endsWith('.html')
      && i.date
      && (import.meta.env.DEV || !i.draft) // filter draft posts in production (SSG safety net)
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

  return [...topPosts, ...otherPosts]
}
