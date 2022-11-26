export * from '../composables'
export * from './home.d'

export namespace PressTheme {
  export type Sidebar = any

  export interface Footer {
    message?: string;
    copyright?: string;
  }

  export interface Config {
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
    sidebar: string[]

    footer: Footer
  }
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
export type ThemeConfig = PressTheme.Config
export type ThemeUserConfig = Partial<ThemeConfig>
