export type ValaxyThemeConfig = Record<string, any>
export interface ValaxyConfig<T = ValaxyThemeConfig> {
  /**
   * 站点标题
   */
  title: string
  /**
   * 站点描述
   */
  description: string
  /**
   * 博客作者
   */
  author: string

  theme: string
  themeConfig: T
}

export type UserConfig<T=ValaxyThemeConfig> = Partial<ValaxyConfig<T>>
