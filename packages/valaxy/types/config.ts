export type DefaultThemeConfig = {
  /**
   * Custom header levels of outline in the aside component.
   *
   * @default 2
   */
  outline?: number | [number, number] | 'deep' | false
} & Record<string, any>

export interface SocialLink {
  /**
   * The title of your link
   */
  name: string
  link: string
  /**
   * 图标名称
   * https://icones.js.org/
   */
  icon: string
  color: string
}

export interface AlgoliaSearchOptions {
  enable: boolean
  appId: string
  apiKey: string
  indexName: string
  placeholder?: string
  searchParameters?: any
  disableUserPersonalization?: boolean
  initialQuery?: string
}

// shared with valaxy node and client
export interface SiteConfig<T = DefaultThemeConfig> {
  /**
   * enable auto (light/dark mode)
   * @default 'auto'
   */
  mode: 'light' | 'dark' | 'auto'
  /**
   * Default language
   * @description 默认语言
   * @default 'en'
   */
  lang: string
  /**
   * You site url in web, required for ssg & rss
   * @description 站点的 URL，SSG & RSS 需要（譬如生成版权处文章永久链接）
   * @default '/'
   */
  url: string
  /**
   * Site title
   * @description 站点标题
   */
  title: string
  /**
   * 副标题
   */
  subtitle: string
  /**
   * 站点描述
   */
  description: string
  /**
   * The owner of this blog
   * @description 博客作者
   */
  author: {
    /**
     * Your name
     * @description 你的名字
     */
    name: string
    email: string
    link: string
    avatar: string
    /**
     * The status of you
     * @description 状态
     */
    status: {
      emoji: string
      /**
       * show when hover emoji
       * @description 当鼠标悬浮在图标上时显示
       */
      message: string
    }
  }

  date: {
    /**
     * The format of date
     * @default '' as 'YYYY-MM-DD HH:mm:ss'
     */
    format: string
  }
  /**
   * show last updated time by git/mtime
   */
  lastUpdated: boolean

  /**
   * icon for your website
   */
  favicon: string

  feed: {
    /**
     * name: feed -> feed.xml / feed.atom / feed.json
     * @default '' -> feed.xml / atom.xml / feed.json
     */
    name: string
    favicon: string
  }

  /**
   * 社交链接
   */
  social: SocialLink[]

  /**
   * search
   */
  search: {
    enable: boolean
    algolia: AlgoliaSearchOptions
  }

  /**
   * comment: waline/...
   */
  comment: {
    enable: boolean
    waline: {
      enable: boolean
      serverURL: string
    }
    twikoo: {
      enable: boolean
      envId: string
    }
  }

  /**
   * Markdown Feature
   */
  features: {
    /**
     * enable katex for global
     */
    katex: boolean
  }

  /**
   * third-party plugin need cdn
   * aplayer, twikoo
   * @default 'https://unpkg.com/'
   */
  cdn: {
    prefix: string
  }

  /**
   * The name of theme
   * @description 主题名称
   */
  theme: string
  /**
   * The config of theme
   * @description 主题配置
   */
  themeConfig: T & {
    pkg: {
      name: string
      version: string
      homepage?: string
      [key: string]: any
    }
  }

  /**
   * The license of your posts
   * @description 文章所使用的协议，默认使用 Creative Commons
   * @default https://creativecommons.org/licenses/
   */
  license: {
    /**
     * Whether to show at the bottom of the article
     * @description 是否显示在文章底部
     * @default true
     */
    enabled: boolean
    /**
     * Creative License Language, same with your config.lang
     * when lang === 'zh-CN', use 'zh'
     * @description 默认与站点语言相同
     * @default 'en'
     */
    language: string
    /**
     * Type of license
     * @description 证书类型
     * @default 'by-nc-sa'
     */
    type: 'zero' | 'by-sa' | 'by-nd' | 'by-nc' | 'by-nc-sa' | 'by-nc-nd'
  }

  /**
   * donate for author
   * @description 打赏/赞助
   */
  sponsor: {
    enable: boolean
    title: string
    methods: {
      name: string
      url: string
      color: string
      icon: string
    }[]
  }
}

export type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends object ? PartialDeep<T[P]> : T[P]
}

/**
 * Valaxy User Config
 * @description Valaxy 用户配置
 */
export type UserSiteConfig<ThemeConfig = DefaultThemeConfig> = PartialDeep<SiteConfig<ThemeConfig>>
