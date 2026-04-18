/**
 * `<meting-js>` element attributes
 * @see https://github.com/metowolf/MetingJS#option
 */
export interface MetingProps {
  /** Song ID / playlist ID / album ID / search keyword */
  'id'?: string
  /** Music platform */
  'server'?: 'netease' | 'tencent' | 'kugou' | 'xiami' | 'baidu'
  /** Resource type */
  'type'?: 'song' | 'album' | 'artist' | 'playlist' | 'search'
  /**
   * Music link for auto-parsing
   * @example 'https://y.qq.com/n/yqq/song/001RGrEX3ija5X.html'
   */
  'auto'?: string
  /**
   * Custom Meting API URL
   *
   * Since the default `api.i-meto.com` is no longer available,
   * you can set your own Meting API endpoint here.
   *
   * @see https://github.com/metowolf/MetingJS#advanced-usage
   * @example 'https://api.example.com/meting?server=:server&type=:type&id=:id&r=:r'
   */
  'api'?: string
  /** Enable fixed mode @default false */
  'fixed'?: boolean
  /** Enable mini mode @default false */
  'mini'?: boolean
  /** Audio autoplay @default false */
  'autoplay'?: boolean
  /** Theme color @default '#2980b9' */
  'theme'?: string
  /** Player loop mode @default 'all' */
  'loop'?: 'all' | 'one' | 'none'
  /** Player play order @default 'list' */
  'order'?: 'list' | 'random'
  /** Audio preload @default 'auto' */
  'preload'?: 'auto' | 'metadata' | 'none'
  /** Default volume @default 0.7 */
  'volume'?: number
  /** Prevent multiple players from playing at the same time @default true */
  'mutex'?: boolean
  /** Lyric type @default 0 */
  'lrc-type'?: number
  /** Fold the playlist by default @default false */
  'list-folded'?: boolean
  /** Max height of the playlist @default '340px' */
  'list-max-height'?: string
  /** localStorage key for player settings @default 'metingjs' */
  'storage-name'?: string

  // Self-hosted media attributes
  /** Song name (for self-hosted media) */
  'name'?: string
  /** Artist name (for self-hosted media) */
  'artist'?: string
  /** Audio URL (for self-hosted media) */
  'url'?: string
  /** Cover image URL (for self-hosted media) */
  'cover'?: string

  [key: string]: any
}

export interface MetingOptions {
  global?: boolean
  /**
   * Props for `<meting-js>` element
   * @see https://github.com/metowolf/MetingJS#option
   */
  props?: MetingProps
  options?: {
    animationIn?: boolean
    autoHidden?: boolean
    lyricHidden?: boolean
  }
}
