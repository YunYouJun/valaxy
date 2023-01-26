import type { Post } from '../..'
import { useSiteStore } from '../stores'

export interface BaseCategory {
  total: number
}

export interface ParentCategory extends BaseCategory {
  children: Categories
}

export interface PostCategory extends BaseCategory {
  posts: Post[]
}

export type Category = ParentCategory | PostCategory

// export type Categories = Map<string, Post[] | Category>
export type Categories = Map<string, Category>

export const isParentCategory = (category: any): category is ParentCategory => category.children

/**
 * get categories from posts
 * @returns
 */
export function useCategory(category?: string, posts: Post[] = []): ParentCategory {
  if (!posts.length) {
    const site = useSiteStore()
    posts = site.postList
  }

  const categoryMap: Category = {
    total: posts.length,
    children: new Map([
      ['Uncategorized', { total: 0, posts: [] }],
    ]),
  }

  const uncategorized = categoryMap.children.get('Uncategorized') as PostCategory

  posts.forEach((post: Post) => {
    if (post.categories) {
      if (Array.isArray(post.categories)) {
        const len = post.categories.length

        let c: ParentCategory = categoryMap
        post.categories.forEach((category, i) => {
          if (i === len - 1) {
            if (c.children.has(category)) {
              const cur = c.children.get(category) as PostCategory
              if (cur.posts) {
                cur.total += 1
                cur.posts!.push(post)
              }
            }
            else {
              c.children?.set(category, {
                total: 1,
                posts: [post],
              })
            }
          }
          else {
            if (c.children?.has(category)) {
              const cur = c.children.get(category) as ParentCategory
              cur.total += 1
              c = cur
            }
            else {
              const temp = {
                total: 1,
                children: new Map(),
              }
              c.children?.set(category, temp)
              c = temp
            }
          }
        })
      }
      else {
        // for string
        const category = post.categories
        if (categoryMap.children.has(category)) {
          const cur = categoryMap.children.get(category) as PostCategory
          cur.total += 1
          cur.posts.push(post)
        }
        else {
          categoryMap.children.set(category, {
            total: 1,
            posts: [post],
          })
        }
      }
    }
    else {
      uncategorized.total += 1
      uncategorized.posts.push(post)
    }
  })

  categoryMap.children.forEach((child) => {
    if ('posts' in child)
      child.posts.sort((a, b) => (b.top || 0) - (a.top || 0))
  })

  // clear uncategorized
  if (uncategorized!.total === 0)
    categoryMap.children?.delete('Uncategorized')

  if (!category) {
    return categoryMap
  }
  else {
    const categoryItem = categoryMap.children.get(category)
    if (categoryItem) {
      return {
        total: categoryItem?.total,
        children: new Map([
          [category, categoryItem],
        ]),
      }
    }
    else {
      console.warn(`Do not have category: ${category}`)
      return categoryMap
    }
  }
}
