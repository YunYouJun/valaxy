import type { Post } from 'valaxy'

export interface ServerFunctions {
  // add: (a: number, b: number) => number
  /**
   * 获取文章列表
   */
  getPostList: () => Promise<{
    posts: Post[]
  }>
}

export interface ClientFunctions {
  // alert: (message: string) => void
}
