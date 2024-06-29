import type { ImageObject, NodeRelations } from '@unhead/schema-org'

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

  // schema
  image: NodeRelations<ImageObject | string>

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
   * @description:en-US Custom Markdown class
   * @description:zh-CN 自定义 Markdown 样式
   * @default 'markdown-body'
   */
  markdownClass: string

  /**
   * @description:en-US Post title class
   * @description:zh-CN 文章标题样式
   */
  pageTitleClass: string

  /**
   * icon before title
   */
  icon: string
  /**
   * title color
   * @deprecated Please use `pageTitleClass` | `postTitleClass` instead
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

  /**
   * @description:zh-CN 是否启用加密，password 存在时默认为 true
   */
  encrypt: boolean
  /**
   * @description:zh-CN 加密密码
   */
  password?: string
  /**
   * @description:zh-CN 相册密码
   */
  gallery_password?: string
  /**
   * @description:zh-CN 加密后的内容
   */
  encryptedContent?: string
  /**
   * @description:zh-CN 部分加密的内容
   */
  partiallyEncryptedContents?: string[]
  /**
   * @description:zh-CN 加密后的相册
   */
  encryptedPhotos?: string
  /**
   * @description:en-US Limit the height of the code block in px
   * @description:zh-CN 限制代码块的高度，单位是 px
   */
  codeHeightLimit?: number
  /**
   * @description:en-US Source path for client redirection
   * @description:zh-CN 客户端重定向的源路径
   */
  from?: string | string[]
}
