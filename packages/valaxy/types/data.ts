import type { Post } from './posts'

export type CleanUrlsMode =
  | 'disabled'
  | 'without-subfolders'
  | 'with-subfolders'
export interface Header {
  /**
   * The level of the header
   *
   * `1` to `6` for `<h1>` to `<h6>`
   */
  level: number
  /**
   * The title of the header
   */
  title: string
  /**
   * The slug of the header
   *
   * Typically the `id` attr of the header anchor
   */
  slug: string
  /**
   * Link of the header
   *
   * Typically using `#${slug}` as the anchor hash
   */
  link: string
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
