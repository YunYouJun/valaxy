export interface Album {
  /**
   * @description:en-US Album Link
   */
  url: string
  /**
   * @description:en-US Album cover
   * url
   */
  cover: string
  /**
   * @description:en-US Album caption
   */
  caption: string
  /**
   * @description:en-US Album description
   */
  desc: string
}

export interface Photo {
  src: string
  caption: string
  desc: string
}

export interface PageFrontMatter extends Record<string, any> {
  /**
   * Path of post
   * route.path
   * @description 路径
   */
  path: string
  /**
   * Title
   * @description 文章标题
   */
  title: string
  date: string | number | Date
  /**
   * Updated Time
   */
  updated: string | number | Date
  /**
   * i18n
   */
  lang: string
  /**
   * TODO
   * Read Time
   * @description 阅读时长
   */
  duration: string

  /**
   * @description Author
   * @description:zh-CN 作者
   */
  author: string

  /**
   * Display sponsor info
   * @description 是否开启赞助
   */
  sponsor: boolean
  /**
   * Copyright
   * @description 是否显示文章底部版权信息
   */
  copyright: boolean

  /**
   * cover
   * @description 封面图片
   */
  cover: string
  /**
   * display toc
   * @description 是否显示目录
   */
  toc: boolean
  /**
   * display right sidebar
   * @description 是否显示右侧侧边栏
   */
  aside: boolean

  /**
   * enable markdown-body class
   * @description 是否启用默认的 markdown 样式
   */
  markdown: boolean

  /**
   * icon before title
   */
  icon: string
  /**
   * title color
   */
  color: string
  /**
   * display comment
   */
  comment: boolean
  /**
   * post is end
   * @description 是否完结，将在末尾添加衬线字体 Q.E.D.
   */
  end: boolean

  // third-party features
  /**
   * use aplayer
   */
  aplayer: boolean
  /**
   * use katex
   */
  katex: boolean
  /**
   * use codepen
   */
  codepen: boolean
  /**
   * use medium-zoom
   * @url https://github.com/francoischalifour/medium-zoom
   */
  medium_zoom: boolean

  /**
   * @description:en-US Albums
   * @description:zh-CN 相册
   */
  albums: Album[]

  /**
   * For layout Gallery
   * @description:en-US Photos
   */
  photos: Photo[]
}

export interface PostFrontMatter extends PageFrontMatter {
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
  excerpt_type: 'md' | 'text' | 'html'

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

export type Page = Partial<PageFrontMatter>
export type Post = Partial<PostFrontMatter>
