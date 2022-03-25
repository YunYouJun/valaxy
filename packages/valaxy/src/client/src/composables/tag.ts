import { usePostList } from './post'

export function useTag() {
  const posts = usePostList()
  // todo
  return posts
}
