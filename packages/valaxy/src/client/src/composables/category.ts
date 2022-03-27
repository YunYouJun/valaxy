import type { Post } from 'valaxy'
import { usePostList } from './post'

export type Categories = Map<string, Categories | Post[]>

/**
 * get categories from posts
 * @returns
 */
export function useCategory() {
  const posts = usePostList()

  const categoryMap: Categories = new Map()

  posts.value.forEach((post) => {
    if (post.categories) {
      if (Array.isArray(post.categories)) {
        const len = post.categories.length

        let c = categoryMap
        post.categories.forEach((category, i) => {
          if (i === len - 1) {
            if (c.has(category)) {
              if (Array.isArray(c.get(category)))
                (c.get(category) as Post[])?.push(post)
            }

            else { c.set(category, [post]) }
          }
          else {
            if (c.has(category)) {
              c = c.get(category) as Categories
            }
            else {
              const temp = new Map()
              c.set(category, temp)
              c = temp
            }
          }
        })
      }
      else {
        const category = post.categories
        if (categoryMap.has(category))
          (categoryMap.get(category) as Post[]).push(post)
        else
          categoryMap.set(category, [post])
      }
    }
  })

  return categoryMap
}
