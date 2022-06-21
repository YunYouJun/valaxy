import type { Post } from './posts'

export interface Header {
  level: number
  title: string
  slug: string
  /**
   * i18n
   */
  lang?: string
}

export interface PageData {
  path: string
  relativePath: string
  title: string
  titleTemplate?: string
  description: string
  headers: Header[]
  frontmatter: Post
  lastUpdated?: number
}

export interface PageDataPayload {
  path: string
  pageData: PageData
}

export type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
