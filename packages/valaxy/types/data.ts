import type { Header } from '@valaxyjs/utils'
import type { Post } from './posts'

export type CleanUrlsMode
  = | 'disabled'
    | 'without-subfolders'
    | 'with-subfolders'

export interface PageData {
  relativePath: string
  /**
   * differs from relativePath in case of path rewrites
   * absolute file path
   */
  filePath?: string
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

export type HeadConfig
  = | [string, Record<string, string>]
    | [string, Record<string, string>, string]
