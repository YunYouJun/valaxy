export * from '../composables'
export * from './home.d'

export namespace DocsTheme {
  export type Config = ThemeConfig
  export type Sidebar = any
}

/**
 * Theme Config
 */
export interface ThemeConfig {
  /**
   * toc title
   * @default 'On this page'
   */
  outlineTitle: string

  colors: {
    /**
     * primary color
     * @default '#0078E7'
     */
    primary: string
  }

  sidebar: string[]

  nav: {
    link: string
    text: string
  }[]
}

export type ThemeUserConfig = Partial<ThemeConfig>
