export interface Header {
  /**
   * The level of the header
   *
   * `1` to `6` for `<h1>` to `<h6>`
   */
  level: number
  /**
   * The title of the header
   */
  title: string
  /**
   * The slug of the header
   *
   * Typically the `id` attr of the header anchor
   */
  slug: string
  /**
   * Link of the header
   *
   * Typically using `#${slug}` as the anchor hash
   */
  link: string
  /**
   * i18n
   */
  lang?: string
}

/**
 * @en
 * Menu item, the title menu parsed from the article.
 *
 * @zh
 * 菜单项，从文章中解析出的标题菜单。
 */
export type MenuItem = Omit<Header, 'slug' | 'children'> & {
  element: HTMLHeadElement
  children?: MenuItem[]
}
