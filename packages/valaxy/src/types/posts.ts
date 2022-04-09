export interface Post extends Record<string, any> {
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
  /**
   * post card type, can be bilibili/yuque/...
   */
  type?: string
  /**
   * override url, and jump directly
   */
  url?: string
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
   * @description 分类，若为数组，则按顺序代表多层文件夹
   */
  categories?: string | string[]
  /**
   * Tags
   * @description 标签，可以有多个
   */
  tags?: string[]

  /**
   * display prev next
   * @description 是否显示前一篇、后一篇导航
   */
  nav?: boolean

  /**
   * icon before title
   */
  icon?: string
  /**
   * title color
   */
  color?: string
  /**
   * display comment
   */
  comment?: boolean
  /**
   * post is end
   * @description 是否完结，将在末尾添加衬线字体 Q.E.D.
   */
  end?: boolean

  /**
   * use aplayer
   */
  aplayer?: boolean
  /**
   * use katex
   */
  katex?: boolean
  /**
   * use codepen
   */
  codepen?: boolean

  /**
   * 置顶
   */
  top?: number

  /**
   * display toc
   * @description 是否显示目录
   */
  toc?: boolean
}
