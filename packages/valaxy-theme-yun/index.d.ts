export * from './dist/index'
import type { ThemeUserConfig } from './dist/index.d'

declare module 'valaxy' {
  interface UserConfig<T = ThemeUserConfig> {
    themeConfig: T
  }
}
