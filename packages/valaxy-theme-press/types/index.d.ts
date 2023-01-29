export * from '../composables'
export * from './home.d'

export namespace PressTheme {
  export type Sidebar = any

  export interface Footer {
    message?: string;
    copyright?: string;
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

  export interface Config {
    logo: string

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

    editLink: EditLink

    footer: Footer

    socialLinks: SocialLink[]

    // label
    /**
     * Toggle dark label
     */
    darkModeSwitchLabel?: string
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
