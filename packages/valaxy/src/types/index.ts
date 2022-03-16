export type ValaxyThemeConfig = Record<string, any>
export interface ValaxyConfig<T = ValaxyThemeConfig> {
  theme: string
  themeConfig: T
}

export type UserConfig<T=ValaxyThemeConfig> = Partial<ValaxyConfig<T>>
