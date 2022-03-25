import { usePostList } from './post'

export function useCatrgory() {
  const posts = usePostList()
  // todo
  return posts
}
