import type { Post } from 'valaxy'
import { formatDate, orderByMeta } from 'valaxy'

export interface ArchiveYearGroup {
  year: number
  posts: Post[]
}

/**
 * Group visible dated posts by year and sort both years and each year's posts.
 */
export function groupPostsByYear(
  posts: readonly Post[],
  orderBy: 'date' | 'updated' = 'date',
  desc = true,
  timezone?: string,
): ArchiveYearGroup[] {
  const byYear = new Map<number, Post[]>()

  for (const post of posts) {
    if (post.hide && post.hide !== 'index')
      continue
    if (!post.date)
      continue

    const year = Number.parseInt(formatDate(post.date, { template: 'YYYY', timezone }), 10)
    if (Number.isNaN(year))
      continue

    const list = byYear.get(year)
    if (list)
      list.push(post)
    else
      byYear.set(year, [post])
  }

  const years = [...byYear.keys()].sort((a, b) => desc ? b - a : a - b)

  return years.map(year => ({
    year,
    posts: orderByMeta([...byYear.get(year)!], orderBy, desc, timezone),
  }))
}
