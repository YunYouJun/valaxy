import { usePostList } from './post'

export type Tags = Map<string, {
  count: number
}>

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
