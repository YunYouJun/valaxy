import type { PartialDeep } from 'type-fest'

export type ValaxyThemeConfig = Record<string, any>
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

  theme: string
  themeConfig: T
}

export type UserConfig<T=ValaxyThemeConfig> = PartialDeep<ValaxyConfig<T>>
