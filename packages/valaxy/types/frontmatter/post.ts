import type { PageFrontMatter } from './page'

export type ExcerptType = 'md' | 'html' | 'text' | 'ai'

export interface PostFrontMatter extends PageFrontMatter {
  /**
   * @description:en-US Custom post title class in post list
   * @description:zh-CN 文章列表中 自定义标题样式
   */
  postTitleClass: string

  /**
   * post card type, can be bilibili/yuque/...
   */
  type: string
  /**
   * override url, and jump directly
   */
  url: string
  /**
   * @description 摘要
   */
  excerpt: string
  /**
   * @default 'html'
   * render type of excerpt
   * - md: render as raw markdown
   * - html: render as html
   * - text: render as text
   */
  excerpt_type: 'md' | 'text' | 'html' | 'ai'

  /**
   * Category
   * @description 分类，若为数组，则按顺序代表多层文件夹
   */
  categories: string | string[]
  /**
   * Tags
   * @description 标签，可以有多个
   */
  tags: string[]

  /**
   * display prev next
   * @description 是否显示前一篇、后一篇导航
   */
  nav: boolean

  /**
   * 置顶
   */
  top: number

  /**
   * is draft
   * @description 是否为草稿
   */
  draft: boolean
  /**
   * hide in index
   * - true/`all`: hide in index & archive
   * - `index`: hide in index
   * @description 是否隐藏
   */
  hide: 'index' | boolean

  /**
   * when the post is updated more than 30 days ago, show a warning
   * default 30 days, you can set `time_warning` in frontmatter to change it
   *
   * @zh
   * 当文章更新时间超过 30 天时，显示一个警告
   * 默认 30 天，你可以在 frontmatter 中设置 `time_warning` （数字）来修改，单位 ms
   * @example 3600000
   */
  time_warning: boolean | number
}
