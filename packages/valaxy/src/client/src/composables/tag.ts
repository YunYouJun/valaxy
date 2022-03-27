import { TinyColor } from '@ctrl/tinycolor'
import { usePostList } from './post'

export type Tags = Map<string, {
  count: number
}>

/**
 * get utils about tags
 */
export function useTags() {
  const tags = useTag()

  const gray = new TinyColor('#999999')
  const primaryColor = new TinyColor(getComputedStyle(document.documentElement).getPropertyValue('--yun-c-primary'))

  const getTagStyle = (count: number) => {
    const counts = Array.from(tags).map(([_, value]) => value.count)
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
 * @returns
 */
export function useTag() {
  const posts = usePostList()

  const tagMap: Tags = new Map()

  posts.value.forEach((post) => {
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
}
