import { TinyColor } from '@ctrl/tinycolor'
import { computed } from 'vue'
import type { Post } from '../..'
import { useSiteStore } from '../stores'

export type Tags = Map<string, {
  count: number
}>

/**
 * get utils about tags
 */
export function useTags(options: {
  /**
   * Primary Color
   */
  primary: string
} = {
  primary: '#0078E7',
}) {
  const tags = useTag()

  const gray = new TinyColor('#999999')
  const primaryColor = new TinyColor(options.primary)

  const getTagStyle = (count: number) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const counts = Array.from(tags.value).map(([_, value]) => value.count)
    const max = Math.max(...counts)
    const min = Math.min(...counts)
    const range = max - min
    const percent = (count - min) / range
    return {
      '--yun-tag-color': gray.mix(primaryColor, percent * 100).toString(),
      'fontSize': `${percent * 36 + 12}px`,
    }
  }

  return {
    tags,
    getTagStyle,
  }
}

/**
 * get tag map
 * [tagName]: count
 * @returns
 */
export function useTag() {
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
