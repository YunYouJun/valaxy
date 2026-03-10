import type { Post, SiteConfig } from 'valaxy'
import type { ComputedRef } from 'vue'
import type { CollectionConfig } from '../../types'
import collections from '#valaxy/blog/collections'
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
 * Merge collapsed collections into the post list.
 * Collapsed collections replace their individual articles with a single
 * synthetic entry that uses the latest article's date for sorting.
 */
export function mergeCollapsedCollections(
  posts: Post[],
  allPages: Post[],
  collections: CollectionConfig[],
  siteConfig: SiteConfig,
): Post[] {
  const collapsedCollections = collections.filter(c => c.collapse !== false)

  if (collapsedCollections.length === 0)
    return posts

  const collectionEntries: Post[] = []
  for (const col of collapsedCollections) {
    if (!col.key)
      continue

    const prefix = `/collections/${col.key}/`
    const colPages = allPages
      .filter(p => p.path?.startsWith(prefix) && p.path !== prefix && !p.path.endsWith('/') && p.date)

    if (colPages.length === 0)
      continue

    // Find latest updated article for sort position
    const latest = colPages.reduce((a, b) => {
      const aTime = new Date(a.updated || a.date || '').getTime()
      const bTime = new Date(b.updated || b.date || '').getTime()
      return bTime > aTime ? b : a
    })

    // Create synthetic post entry representing the collapsed collection
    collectionEntries.push({
      title: col.title || latest.title,
      path: `/collections/${col.key}/`,
      cover: col.cover || latest.cover,
      date: latest.date,
      updated: latest.updated,
      categories: col.categories || latest.categories,
      tags: col.tags || latest.tags,
      _collection: col,
    })
  }

  if (collectionEntries.length === 0)
    return posts

  function sortBySiteConfigOrderBy(entries: Post[]) {
    return orderByMeta(entries, siteConfig.orderBy)
  }

  // Re-sort only when collection entries were actually added
  // to preserve the topPosts-first ordering from filterAndSortPosts
  const topPosts = posts.filter(i => i.top)
  const otherPosts = posts.filter(i => !i.top)
  const mergedOther = sortBySiteConfigOrderBy([...otherPosts, ...collectionEntries])
  return [...topPosts, ...mergedOther]
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

/**
 * Get post list merged with collapsed collection entries.
 * Collapsed collections appear as a single card, and their individual
 * articles are removed from the list.
 *
 * @experimental
 */
export function usePostListWithCollections(params: {
  type?: string
} = {}) {
  const siteConfig = useSiteConfig()
  const pageList = usePageList()

  return computed(() => {
    const posts = filterAndSortPosts(pageList.value, siteConfig.value, params)
    return mergeCollapsedCollections(posts, pageList.value, collections as CollectionConfig[], siteConfig.value)
  })
}
