import type { KnownEditor } from 'devframe/utils/launch-editor'
import type { Post } from 'valaxy'
import type { ValaxyPageDebug } from './debug'

export interface BlogWindow {
  $frontmatter: any
}

export interface ClientOptions {
  userRoot: string
  siteUrl?: string
  editor?: KnownEditor
  editors?: KnownEditor[]
}

export interface ClientPostList {
  posts: ClientPageData[]
}

export interface ClientPageData {
  /** Present only in live browser snapshots; never loaded from article files. */
  debug?: ValaxyPageDebug
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
  link?: string
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

export type BatchFrontmatterOperation = {
  /**
   * 操作类型
   * - set: 设置/更新字段值
   * - delete: 删除字段
   * - rename: 重命名字段（oldKey -> newKey）
   */
  type: 'set'
  key: string
  value: unknown
} | {
  type: 'delete'
  key: string
} | {
  type: 'rename'
  key: string
  newKey: string
}

export interface BatchUpdateResult {
  total: number
  updated: number
  errors: { filePath: string, error: string }[]
}

export interface ConfigData {
  siteConfig: Record<string, any>
  valaxyConfig: Record<string, any>
  themeConfig: Record<string, any>
  siteConfigExists: boolean
  valaxyConfigExists: boolean
  siteConfigPath: string
  valaxyConfigPath: string
}

export interface ConfigUpdateRequest {
  configType: 'site' | 'valaxy' | 'theme'
  fieldPath: string
  value: any
}

export interface CreatePostOptions {
  /** 文章标题 */
  title: string
  /** 文件路径（相对于 pages/posts/），如 'my-post.md' 或 'sub/my-post.md' */
  path?: string
  /** 标签 */
  tags?: string[]
  /** 分类 */
  categories?: string[]
}

export interface UpdateFrontmatterRequest {
  filePath: string
  frontmatter: Record<string, any>
}

/** Markdown body and its optimistic concurrency token. */
export interface PostContent {
  content: string
  revision: string
}

export interface ServerFunctions {
  /** Read an article body within the project's pages directory. */
  getPostContent: (filePath: string) => Promise<PostContent>
  /** Save the body while preserving current frontmatter and rejecting stale edits. */
  updatePostContent: (req: { filePath: string, content: string, revision: string }) => Promise<PostContent>
  // add: (a: number, b: number) => number
  /**
   * 获取基础配置
   */
  getOptions: () => Promise<ClientOptions>
  /**
   * 获取文章列表
   */
  getPostList: () => Promise<ClientPostList>
  /**
   * 获取页面 pageData
   */
  getPageData: (pagePath: string) => Promise<ClientPageData>
  /**
   * 获取合集列表
   */
  getCollectionList: () => Promise<ClientCollectionData[]>
  /**
   * 更新单个页面的 frontmatter（整体覆盖）
   */
  updateFrontmatter: (req: UpdateFrontmatterRequest) => Promise<{ success: boolean }>
  /**
   * 批量修改文章的 frontmatter
   */
  batchUpdateFrontmatter: (filePaths: string[], operations: BatchFrontmatterOperation[]) => Promise<BatchUpdateResult>
  /**
   * 获取配置数据
   */
  getConfig: () => Promise<ConfigData>
  /**
   * 更新配置字段
   */
  updateConfigField: (configType: 'site' | 'valaxy' | 'theme', fieldPath: string, value: any) => Promise<{ success: boolean, error?: string }>
  /**
   * 运行 frontmatter 迁移
   */
  runMigration: (filePaths: string[], frontmatter: Record<string, any>) => Promise<{ success: boolean }>
  /**
   * 创建新文章
   */
  createPost: (options: CreatePostOptions) => Promise<{ success: boolean, filePath?: string, error?: string }>
}

export interface ClientFunctions {
  // alert: (message: string) => void
}
