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

export interface ClientCollectionItem {
  title: string
  key: string
  filePath: string
  frontmatter: Record<string, any>
}

export interface ClientCollectionData {
  key: string
  title: string
  cover: string
  description: string
  collapse: boolean
  dirPath: string
  items: ClientCollectionItem[]
}
