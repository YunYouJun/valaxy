import type { Post } from '../../types'
import { computed } from 'vue'
import { useSiteStore } from '../stores'

/**
 * @en
 * Tag list, key is tag name, value is the object of tag.
 * - count: the number of posts with this tag.
 *
 * @zh
 * 标签列表，键是标签名，值是标签对象。
 * - count: 使用该标签的文章数量。
 */
export type Tags = Map<string, {
  count: number
}>

/**
 * get tag map
 * [tagName]: count
 */
export function useTags() {
  const site = useSiteStore()

  return computed(() => {
    const tagMap: Tags = new Map()
    site.postList.forEach((post: Post) => {
      if (post.tags) {
        let tags: string[]
        if (typeof post.tags === 'string')
          tags = [post.tags]
        else
          tags = post.tags

        tags.forEach((tag) => {
          if (tagMap.has(tag)) {
            const item = tagMap.get(tag)!
            tagMap.set(tag, {
              ...item,
              count: item.count + 1,
            })
          }
          else {
            tagMap.set(tag, {
              count: 1,
            })
          }
        })
      }
    })
    return tagMap
  })
}

/**
 * @deprecated use `useTags` instead
 */
export const useTag = useTags
