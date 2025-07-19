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

/**
 * @experimental
 * @description Define the collection configuration.
 */
export function defineCollection(config: CollectionConfig) {
  return config
}
