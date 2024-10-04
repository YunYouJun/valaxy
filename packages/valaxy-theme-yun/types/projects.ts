export interface ProjectItem {
  emoji?: string
  /**
   * 项目名称
   */
  name?: string
  /**
   * 项目描述
   */
  desc?: string
  /**
   * 代表色
   */
  color?: string
  /**
   * 渐变色
   */
  gradient?: boolean
  /**
   * 强制覆盖文本色
   */
  textColor?: string

  /**
   * 文档链接
   */
  docs?: string
  /**
   * 站点链接
   */
  url?: string
  /**
   * GitHub 仓库
   */
  github?: string
  /**
   * NPM 包
   */
  npm?: string
}

export interface ProjectDataType {
  [key: string]: {
    title: string
    emoji: string
    collection: ProjectItem[]
  }
}
