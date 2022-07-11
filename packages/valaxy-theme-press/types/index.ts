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
}

export type ThemeUserConfig = Partial<ThemeConfig>
