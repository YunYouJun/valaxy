export interface Post {
  /**
   * Path of post
   * route.path
   * @description 路径
   */
  path?: string
  /**
   * Title
   * @description 文章标题
   */
  title?: string
  date?: string | number | Date
  /**
   * Updated Time
   */
  updated?: string | number | Date
  lang?: string
  /**
   * TODO
   * Read Time
   * @description 阅读时长
   */
  duration?: string
  type?: string
  /**
   * @description 摘要
   */
  excerpt?: string

  /**
   * Display sponsor info
   * @description 是否开启赞助
   */
  sponsor?: boolean
  /**
   * Copyright
   * @description 是否显示文章底部版权信息
   */
  copyright?: boolean

  /**
   * Category
   * @description 分类，只属于一个
   */
  category?: string
  /**
   * Tags
   * @description 标签，可以有多个
   */
  tags?: string[]
}
