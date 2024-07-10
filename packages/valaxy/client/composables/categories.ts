import type { MaybeRef } from '@vueuse/core'
import { computed, unref } from 'vue'
import type { Post } from '../../types'
import { useSiteStore } from '../stores'

/**
 * 基础分类
 */
export interface BaseCategory {
  /**
   * 分类下的文章数量
   */
  total: number
}

/**
 * @en
 * Category list
 *
 * @zh
 * 分类列表
 */
export interface CategoryList {
  /**
   * category name
   */
  name: string
  /**
   * total posts
   */
  total: number
  children: Map<string, Post | CategoryList>
}
export type Category = CategoryList
export type Categories = Map<string, Post | CategoryList>

/**
 * For theme development, you can use this function to determine whether the category is a category list.
 * @todo write unit test
 * @param category
 */
export function isCategoryList(category: any): category is CategoryList {
  return category.children
}

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
 */
export function useCategories(category?: MaybeRef<string>, posts: Post[] = []) {
  return computed(() => {
    const categories = unref(category)

    if (!posts.length) {
      const site = useSiteStore()
      posts = site.postList
    }

    const categoryList: CategoryList = {
      name: 'All',
      total: posts.length,
      children: new Map([
        ['Uncategorized', { name: 'Uncategorized', total: 0, children: new Map() }],
      ]),
    }

    const uncategorized = categoryList.children.get('Uncategorized')!

    posts.forEach((post: Post) => {
      if (post.categories) {
        if (Array.isArray(post.categories)) {
          const len = post.categories.length

          let curCategoryList: CategoryList = categoryList
          let parentCategory: CategoryList = curCategoryList

          post.categories.forEach((categoryName, i) => {
            // console.log(parentCategory, curCategoryList.children, 'post', categoryName)
            curCategoryList.total += 1
            curCategoryList = curCategoryList.children.get(categoryName) as CategoryList

            if (!curCategoryList) {
              curCategoryList = {
                name: categoryName,
                total: 0,
                children: new Map(),
              }
              parentCategory.children.set(categoryName, curCategoryList)
            }

            if (i === len - 1) {
              curCategoryList.children.set(post.path!, post)
              curCategoryList.total += 1
            }

            parentCategory = curCategoryList
          })
        }
        else {
          // for string
          const categoryName = post.categories
          const curCategory = categoryList.children.get(categoryName)
          if (curCategory) {
            curCategory.total += 1
            curCategory.children.set(post.path!, post)
          }
          else {
            categoryList.children.set(categoryName, {
              name: categoryName,
              total: 1,
              children: new Map([
                [post.path!, post],
              ]),
            })
          }
        }
      }
      else {
        uncategorized.total += 1
        uncategorized.children.set(post.path!, post)
      }
    })

    // `top` had been sorted in routes

    // clear uncategorized
    if (uncategorized!.total === 0)
      categoryList.children.delete('Uncategorized')

    if (!categories) {
      return categoryList
    }
    else {
      let curCategoryList = categoryList
      const categoryArr = categories.split('/')
      for (const categoryName of categoryArr) {
        const tempCList = curCategoryList.children.get(categoryName)
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
    categoryList.children.delete(categoryArr[0])
  }
}

/**
 * @deprecated use `useCategories` instead
 */
export const useCategory = useCategories
