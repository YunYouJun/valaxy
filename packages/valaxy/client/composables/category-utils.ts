import type { Post } from '../../types'

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
 * @param category
 */
export function isCategoryList(category: unknown): category is CategoryList {
  return !!category && typeof category === 'object' && 'children' in category && category.children instanceof Map
}

/**
 * remove item from category
 * @param categoryList
 * @param categoryName
 */
export function removeItemFromCategory(categoryList: CategoryList, categoryName: string) {
  const categoryArr = categoryName.split('/')
  categoryList.children.delete(categoryArr[0])
}
