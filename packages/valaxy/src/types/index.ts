import type { PartialDeep } from 'type-fest'
import type { VitePluginConfig } from 'unocss/vite'

export type ValaxyThemeConfig = Record<string, any>

export interface SocialLink {
  name: string
  link: string
  /**
   * 图标名称
   * https://icones.js.org/
   */
  icon: string
  color: string
}

export interface ValaxyConfig<T = ValaxyThemeConfig> {
  /**
   * 站点标题
   */
  title: string
  /**
   * 副标题
   */
  subtitle: string
  /**
   * 站点描述
   */
  description: string
  /**
   * 博客作者
   */
  author: {
    name: string
    avatar: string
    /**
     * 状态
     */
    status: {
      emoji: string
      message: string
    }
  }

  /**
   * 社交链接
   */
  social: SocialLink[]

  theme: string
  themeConfig: T

  /**
   * Unocss Config
   */
  unocss: VitePluginConfig
}

export type UserConfig<T=ValaxyThemeConfig> = PartialDeep<ValaxyConfig<T>>
