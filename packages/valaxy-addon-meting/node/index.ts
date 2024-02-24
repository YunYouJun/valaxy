import { defineValaxyAddon } from 'valaxy'
import pkg from '../package.json'

export interface MetingOptions {
  global?: boolean
  /**
   * @see https://github.com/metowolf/MetingJS#option
   */
  props?: {
    id?: string
    server?: 'netease' | 'tencent' | 'kugou' | 'xiami' | 'baidu'
    type?: 'song' | 'album' | 'artist' | 'playlist' | 'search'
    auto?: 'netease' | 'tencent' | 'xiami'
    fixed?: boolean
    mini?: boolean
    autoplay?: boolean
    theme?: string
    loop?: 'all' | 'one' | 'none'
    order?: string
    preload?: 'auto' | 'metadata' | 'none'
    volume?: number
    work?: string
    mutex?: boolean
    start?: string
    'lrc-type'?: number
    'list-folded'?: boolean
    'list-max-height'?: string
    'storage-name'?: string
    [key: string]: any
  }
  options?: {
    animationIn?: boolean
    autoHidden?: boolean
    lyricHidden?: boolean
  }
}

export const addonMeting = defineValaxyAddon<MetingOptions>(options => ({
  name: pkg.name,
  enable: true,
  global: options?.global ?? false,
  ...options,
}))
