import type { MaybeRef } from '@vueuse/core'
import { computed, unref } from 'vue'
import type { Post } from '../..'
import { useSiteStore } from '../stores'

export interface BaseCategory {
  total: number
}

export interface CategoryList {
  /**
   * category name
   */
  name: string
  /**
   * total posts
   */
  total: number
  children: (Post | CategoryList)[]
}
export type Category = CategoryList
export type Categories = (Post | CategoryList)[]

// todo write unit test
export const isCategoryList = (category: any): category is CategoryList => category.children

/**
 * get categories from posts
 * category: A/B/C
 * {
 *  name: 'A',
 *  total: 1,
 *  children: [
 *    {
 *      name: 'B'
 *      total: 1,
 *      children: [{ name: 'C', total: 1, children: [{ title: '' }] }]
 *    }
 *  ]
 * }
 * @returns
 */
export function useCategory(category?: MaybeRef<string>, posts: Post[] = []) {
  return computed(() => {
    const categories = unref(category)

    if (!posts.length) {
      const site = useSiteStore()
      posts = site.postList
    }

    const categoryList: CategoryList = {
      name: 'All',
      total: posts.length,
      children: [
        { name: 'Uncategorized', total: 0, children: [] },
      ],
    }

    const uncategorized = categoryList.children.find(item => item.name === 'Uncategorized')!

    posts.forEach((post: Post) => {
      if (post.categories) {
        if (Array.isArray(post.categories)) {
          const len = post.categories.length

          let curCategoryList: CategoryList = categoryList
          let parentCategory: CategoryList = curCategoryList

          post.categories.forEach((categoryName, i) => {
            curCategoryList.total += 1
            curCategoryList = (curCategoryList.children.find(item => item.name === categoryName)) as CategoryList

            if (!curCategoryList) {
              curCategoryList = {
                name: categoryName,
                total: 0,
                children: [],
              }
              parentCategory.children.push(curCategoryList)
            }

            if (i === len - 1) {
              curCategoryList.children.push(post)
              curCategoryList.total += 1
            }

            parentCategory = curCategoryList
          })
        }
        else {
          // for string
          const categoryName = post.categories
          const curCategory = categoryList.children.find(item => item.name === categoryName)
          if (curCategory) {
            curCategory.total += 1
            curCategory.children.push(post)
          }
          else {
            categoryList.children.push({
              name: categoryName,
              total: 1,
              children: [post],
            })
          }
        }
      }
      else {
        uncategorized.total += 1
        uncategorized.children.push(post)
      }
    })

    // `top` had been sorted in routes

    // clear uncategorized
    if (uncategorized!.total === 0)
      categoryList.children.shift()

    if (!categories) {
      return categoryList
    }
    else {
      let curCategoryList = categoryList
      const categoryArr = categories.split('/')
      for (const categoryName of categoryArr) {
        const tempCList = curCategoryList.children.find(item => item.name === categoryName)
        if (tempCList && tempCList.children) {
          curCategoryList = tempCList as CategoryList
        }
        else {
          console.warn(`Do not have category: ${category}`)
          return categoryList
        }
      }
      return curCategoryList
    }
  })
}

/**
 * remove item from category
 * @param categoryList
 * @param categoryName
 */
export function removeItemFromCategory(categoryList: CategoryList, categoryName: string) {
  if (isCategoryList(categoryList)) {
    const categoryArr = categoryName.split('/')
    // todo loop find
    const categoryListItemIndex = categoryList.children.findIndex(item => item.name === categoryArr[0])

    categoryList.children.splice(categoryListItemIndex, 1)
  }
}
