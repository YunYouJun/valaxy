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
   * Disply reward info
   * @description 是否显示打赏信息
   */
  reward?: boolean
  /**
   * Copyright
   * @description 是否显示文章底部版权信息
   */
  copyright?: boolean
}
