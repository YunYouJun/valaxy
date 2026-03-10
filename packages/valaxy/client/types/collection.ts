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
   * @en Whether to show collection as a single collapsed entry in homepage/archive lists.
   * When true (default), a synthetic collection card is added to the post list,
   * representing all articles in the collection as one entry.
   * When false, no synthetic entry is added.
   * @zh 是否在首页/归档列表中以单个条目展示合集。
   * 为 true（默认）时，合集以一张卡片出现在文章列表中，
   * 代表合集内的所有文章。
   * 为 false 时，不添加合集条目。
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
