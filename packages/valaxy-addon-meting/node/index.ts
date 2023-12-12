import { defineValaxyAddon } from 'valaxy'
import pkg from '../package.json'

export interface MetingOptions {
  global?: boolean
  /**
   * @see https://github.com/metowolf/MetingJS#option
   */
  options?: {
    id?: string
    server?: string
    type?: string
    auto?: string
    fixed?: boolean
    mini?: boolean
    autoplay?: boolean
    theme?: string
    loop?: string
    order?: string
    preload?: string
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
}

export const addonMeting = defineValaxyAddon<MetingOptions>(options => ({
  name: pkg.name,
  enable: true,
  global: options?.global ?? false,
  ...options,
}))
