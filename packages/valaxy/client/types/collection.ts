export interface CollectionConfig {
  title?: string
  key?: string
  /**
   * if key is not provided, path is required
   *
   * if key is provided, path = `/collections/${key}`
   */
  path?: string
  /**
   * @en
   * The name of the collection.
   *
   * @zh
   * 合集名称
   */
  name?: string
  cover?: string
  description?: string
  categories?: string[]
  tags?: string[]

  /**
   * @en Whether to collapse collection articles in homepage/archive lists.
   * When true, collection articles are hidden from the regular post list
   * and the collection appears as a single entry instead.
   * @zh 是否在首页/归档列表中折叠合集文章。
   * 为 true 时，合集文章不在普通文章列表中显示，
   * 合集以一个条目出现。
   * @default true
   */
  collapse?: boolean

  /**
   * items
   */
  items?: {
    title?: string
    /**
     * 合集文章的唯一索引
     *
     * 对应路径为 `/collections/${key}/${item.key}`
     */
    key?: string
  }[]
}
