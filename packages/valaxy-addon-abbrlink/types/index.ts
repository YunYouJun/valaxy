/**
 * abbrlink options
 *
 * for migrate compatibility [hexo-abbrlink](https://github.com/ohroy/hexo-abbrlink)
 */
export interface Options {
  /**
   * Algorithm used to calc abbrlink
   * @default 'crc32'
   */
  algorithm?: 'crc32' | 'crc16'
  /**
   * Representation of abbrlink in URLs
   *
   * @default 'hex'
   */
  rep?: 'dec' | 'hex'
  /**
   * @todo
   *
   * Whether to generate abbrlink for drafts
   */
  drafts?: boolean
  /**
   * Enable force mode. In this mode, the plugin will ignore the cache, and calc the abbrlink for every post even it already had an abbrlink. (false in default)
   *
   * @default false
   */
  force?: boolean
  /**
   * Whether to write changes to front-matters back to the actual markdown files. (true in default)
   *
   * @default true
   */
  writeback?: boolean
  /**
   * Whether to override the raw post path
   *
   * @default false
   */
  override?: boolean
}
