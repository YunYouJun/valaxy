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

  export interface LocaleSpecificConfig {
    /** Label shown in locale switcher (e.g. "English", "简体中文") */
    label?: string
    /** BCP 47 language tag (e.g. "en", "zh-CN") */
    lang?: string
    /** URL prefix for this locale (e.g. "/zh/"), defaults to `/${key}/` */
    link?: string
    /** Per-locale theme config overrides, shallow-merged with top-level Config */
    themeConfig?: Partial<Omit<Config, 'locales' | 'i18nRouting'>>
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

    /**
     * Locale configurations. Key is a path prefix ('root' for the default locale).
     */
    locales?: Record<string, LocaleSpecificConfig>

    /**
     * Whether to automatically adjust URL path when switching locales.
     * @default false
     */
    i18nRouting?: boolean
  }
}

export interface NavItemLink {
  link: string
  text: string
  active?: string
}

export interface NavItemChildren {
  text?: string
  items: NavItemLink[]
}

export interface NavItemWithChildren {
  text?: string
  items?: (NavItemChildren | NavItemLink)[]
  active?: string
}

export type NavItem = NavItemLink | NavItemWithChildren

/**
 * Theme Config
 */
export type ThemeConfig = PressTheme.Config
export type UserThemeConfig = Partial<ThemeConfig>
