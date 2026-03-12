/**
 * @experimental
 * Options for valaxy-addon-feishu.
 * This addon and its API are experimental and may change in future releases.
 */
export interface FeishuAddonOptions {
  /**
   * Feishu app ID (from Feishu Open Platform)
   * @see https://open.feishu.cn/
   */
  appId: string
  /**
   * Feishu app secret (from Feishu Open Platform)
   */
  appSecret: string
  /**
   * Wiki space ID — fetch all docs from this wiki space.
   * You can find this in the wiki space URL.
   */
  spaceId?: string
  /**
   * List of specific document IDs to fetch.
   * Can be used alone or combined with `spaceId`.
   */
  documents?: string[]
  /**
   * Path prefix under pages/, e.g. 'posts' -> pages/posts/xxx.md
   * @default 'posts'
   */
  prefix?: string
  /**
   * Dev mode polling interval in ms.
   * Set to enable periodic re-fetching during development.
   * @default 60000
   */
  devPollInterval?: number
  /**
   * Download images from Feishu to local public/ directory.
   * When enabled, image URLs in markdown are rewritten to local paths.
   * @default true
   */
  downloadImages?: boolean
  /**
   * Subdirectory in public/ for downloaded images.
   * @default 'feishu-images'
   */
  imageDir?: string
}
