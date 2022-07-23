export * from '../composables'
export * from './home.d'

export namespace DocsTheme {
  export type Config = ThemeConfig
  export type Sidebar = any
}

export interface NavItemLink {
  link: string
  text: string
  active?: string
}

export interface NavItemGroup {
  text: string
  items: NavItemLink[]
}

export type NavItem = NavItemLink | NavItemGroup

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

  nav: Array<NavItem>
}

export type ThemeUserConfig = Partial<ThemeConfig>
