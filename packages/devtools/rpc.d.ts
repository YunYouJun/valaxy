import type { ClientCollectionData, ClientOptions, ClientPageData, ClientPostList } from './client/types'

export interface BatchFrontmatterOperation {
  /**
   * 操作类型
   * - set: 设置/更新字段值
   * - delete: 删除字段
   * - rename: 重命名字段（oldKey -> newKey）
   */
  type: 'set' | 'delete' | 'rename'
  key: string
  value?: any
  newKey?: string
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

export interface ServerFunctions {
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
}

export interface ClientFunctions {
  // alert: (message: string) => void
}
