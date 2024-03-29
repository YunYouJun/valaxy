export interface BangumiOptions {
  /**
   * 后端 api 地址
   */
  api: string

  /**
   * Bilibili 的 uid，在后端中引入 uid 的 env 后可以不设置
   */
  bilibiliUid?: string

  /**
   * Bangumi 的 uid，在后端中引入 uid 的 env 后可以不设置
   */
  bgmUid?: string

  /**
   * 是否展示 Bilibili 平台
   * @default true
   */
  bilibiliEnabled?: boolean

  /**
   * 是否展示 Bangumi 平台
   * @default true
   */
  bgmEnabled?: boolean

  /**
   * 自定义 css
   * @example
   * .bbc-bangumi-title a { color: red; }
   */
  customCss?: string

  /**
   * 分页大小
   * @default 15
   */
  pageSize?: number

  /**
   * 是否启用自定义数据源
   * @default false
   */
  customEnabled?: boolean

  /**
   * 自定义数据源的展示标签名
   * @default '自定义'
   */
  customLabel?: string
}
