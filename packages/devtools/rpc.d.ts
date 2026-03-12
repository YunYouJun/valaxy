import type { ClientCollectionData, ClientOptions, ClientPageData, ClientPostList } from './client/types'

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
}

export interface ClientFunctions {
  // alert: (message: string) => void
}
