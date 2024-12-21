import type { Post } from 'valaxy'

export interface BlogWindow {
  $frontmatter: any
}

export interface ClientOptions {
  userRoot: string
}

export interface ClientPostList {
  posts: ClientPageData[]
}

export interface ClientPageData {
  frontmatter: Post
  /**
   * route.path
   */
  routePath: string
  /**
   * 绝对路径
   */
  filePath: string
}
