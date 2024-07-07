import type { DefaultTheme } from 'valaxy'

export * from '../composables'
export * from './home.d'

export namespace PressTheme {
  export type Sidebar = any

  export interface Footer {
    message?: string
    copyright?: string
  }

  export interface SocialLink {
    icon: string
    link: string
  }

  export interface EditLink {
    /**
     * Pattern for edit link.
     *
     * @example 'https://github.com/YunYouJun/valaxy/edit/main/docs/:path'
     */
    pattern: string

    /**
     * Custom text for edit link.
     *
     * @default 'Edit this page'
     */
    text?: string
  }

  export type Sidebar = SidebarItem[] | SidebarMulti
  export interface SidebarMulti {
    [path: string]: SidebarItem[] | { items: SidebarItem[], base: string }
  }
  export interface SidebarItem {
    /**
     * The text label of the item.
     */
    text?: string

    /**
     * The link of the item.
     */
    link?: string

    /**
     * The children of the item.
     */
    items?: SidebarItem[]

    /**
     * If not specified, group is not collapsible.
     *
     * If `true`, group is collapsible and collapsed by default
     *
     * If `false`, group is collapsible but expanded by default
     */
    collapsed?: boolean

    /**
     * Base path for the children items.
     */
    base?: string

    /**
     * Customize text that appears on the footer of previous/next page.
     */
    docFooterText?: string

    rel?: string
    target?: string
  }

  export interface Config extends DefaultTheme.Config {
    logo: string

    colors: {
      /**
       * primary color
       * @default '#0078E7'
       */
      primary: string
    }

    nav: NavItem[]
    sidebar?: Sidebar

    editLink: EditLink

    footer: Footer

    socialLinks: SocialLink[]
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
export type UserThemeConfig = Partial<ThemeConfig>
