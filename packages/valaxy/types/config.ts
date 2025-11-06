import type { FuseOptions } from '@vueuse/integrations/useFuse'
import type { ZoomOptions } from 'medium-zoom'
import type { ILazyLoadOptions } from 'vanilla-lazyload'
import type { RouteRecordRaw } from 'vue-router'
import type { ValaxyAddon } from './addon'
import type { DefaultTheme } from './default-theme'
import type { PostFrontMatter } from './frontmatter'
import type { FuseListItem } from './node'

import './default-theme'

/**
 * @zh 社交链接
 */
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
  /**
   * @zh 图标颜色
   */
  color: string
}

export interface RedirectRule {
  to: string
  from: string | string[]
}

export interface RedirectItem {
  from: string
  to: string
}

// shared with valaxy node and client
export interface SiteConfig {
  /**
   * enable auto (light/dark mode)
   * @default 'auto'
   */
  mode: 'light' | 'dark' | 'auto'
  /**
   * Default language
   * @description 默认语言，设置 `zh-CN` 以改变默认语言为中文
   * @default 'en'
   */
  lang: string
  /**
   * alternative languages
   * @description 可选语言
   * @en If you want to disable multi-language support for your site, you can set this to only include one language (e.g. `['en']`)
   * @zh 如果你想要禁言站点的多语言支持，可以将此项设置为仅包含一个语言 (例如 `['zh-CN']`)
   * @default ['en', 'zh-CN']
   * @see https://ogp.me/#optional
   */
  languages: string[]
  /**
   * You site url in web, required for ssg & rss
   * @description 站点的完整 URL，SSG & RSS 需要（譬如生成版权处文章永久链接）
   * @example 'https://valaxy.site'
   * @default '/'
   */
  /**
   * @see https://wikipedia.org/wiki/List_of_tz_database_time_zones
   * @en_US Timezone configuration
   * @zh_CN 时区配置，国内推荐使用 'Asia/Shanghai'
   * @description:en-US This configuration is used to generate times with timezone when no timezone is set
   * @description:zh-CN 当时间没有设置时区时，使用该配置生成带时区的时间
   * @default ''
   */
  timezone: string
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
      /**
       * Emoji representation of your status like '👨‍💻'
       * @description 你的状态的 Emoji 表示，如 '👨‍💻'
       */
      emoji: string
      /**
       * show when hover emoji
       * @description 当鼠标悬浮在图标上时显示
       */
      message: string
    }
    /**
     * @zh 个人简介
     */
    intro?: string
  }

  /**
   * order posts by 'date' or 'updated'
   *
   * - date: 按创建时间排序
   * - updated: 按最后更新时间排序
   *
   * 当开启 `lastUpdated` 时，`updated` 会按照文件的更新时间自动赋值
   *
   * @default 'date'
   */
  orderBy: 'date' | 'updated'

  /**
   * show last updated time by git/mtime
   * @default false
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
   * @en search engine for your site
   * @zh 搜索功能
   */
  search: {
    /**
     * @zh 是否启用
     */
    enable: boolean
    /**
     * @deprecated will be deprecated, use search.provider instead
     */
    type?: SiteConfig['search']['provider']
    /**
     * Search Type
     * - algolia: Algolia Search
     * - engine: Engine Search, like Google/Baidu
     * - fuse: Local Search by fuse.js
     * - local(todo): Local Search by MiniSearch
     */
    provider: 'algolia' | 'engine' | 'fuse' | 'local'
  }

  /**
   *
   * fuse search
   * @see https://fusejs.io/
   * @description 本地搜索
   * Please set search.provider to 'fuse'
   */
  fuse: {
    /**
     * @default 'valaxy-fuse-list.json'
     * @description 搜索结果列表数据所在路径
     */
    dataPath: string
    /**
     * fast-glob pattern to match Fuse List Data
     * @default `pages\/**\/*.md`
     * ```ts
     * await fg(`${userRoot}/pages/posts/**\/*.md`)
     * ```
     */
    pattern?: string
    /**
     * @see https://fusejs.io/api/options.html
     */
    options: FuseOptions<FuseListItem> & {
      /**
       * @en_US The fields to be searched.
       * @zh_CN 搜索的字段
       * @default ['title', 'tags', 'categories', 'excerpt']
       * @description:en-US List of keys that will be searched. This supports nested paths, weighted search, and searching in arrays of strings and objects
       * @description:zh-CN 搜索将会涉及的字段列表，支持嵌套路径、加权搜索以及在字符串和对象数组中进行搜索
       * @see https://fusejs.io/api/options.html#keys
       */
      keys: FuseOptions<FuseListItem>['keys']
    }
  }

  /**
   * set post default frontmatter
   */
  frontmatter: Partial<PostFrontMatter>

  /**
   * comment: waline/...
   */
  comment: {
    enable: boolean
  }

  /**
   * third-party plugin need cdn
   * aplayer, twikoo
   * @default 'https://unpkg.com/'
   */
  cdn: {
    /**
     * prefix for your third-party
     * @default 'https://unpkg.com/'
     */
    prefix: string
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
    /**
     * Donate button title attribute
     * @description 打赏按钮的 title 属性
     * @default zh:'打赏' en:'Donate'
     */
    title?: string
    /**
     * Donate content description
     * @description 打赏的描述内容，在按钮下方所有图片上方，与图片一起折叠
     * @default undefined 不显示内容
     */
    description?: string
    /**
     * @zh 赞助方式
     */
    methods: {
      name: string
      url: string
      color: string
      icon: string
    }[]
  }

  /**
   * image preview by medium-zoom
   * @url https://github.com/francoischalifour/medium-zoom
   */
  mediumZoom: {
    /**
     * @zh 启用图片预览
     */
    enable: boolean
    /**
     * For example: '.markdown-body img'
     * @default '' content.value querySelectorAll('img')
     */
    selector: string | HTMLElement | HTMLElement[]
    /**
     * @zh 配置项
     * @see https://github.com/francoischalifour/medium-zoom#options
     */
    options: ZoomOptions
  }

  /**
   * lazyload by vanilla-lazyload and markdown-it-image-figures
   * when vanillaLazyLoad.enable is true, imageFigures removeSrc is true, classes is 'lazy'
   * @see https://github.com/verlok/vanilla-lazyload
   */
  vanillaLazyload: {
    enable: boolean
    options: ILazyLoadOptions
  }

  /**
   * Floating Vue configuration for floating footnote tooltips.
   * @see https://floating-vue.starpad.dev/guide/config
   */
  floatingVue: any // FloatingVueConfig is an alias of any, consult the documentation for actual type

  /**
   * displayed posts length in every page
   * @default 7
   */
  pageSize: number

  /**
   * statistics readingTime and wordCount
   * @description 统计阅读时间和字数
   */
  statistics: {
    enable: boolean
    readTime: {
      speed: {
        /**
         * Chinese word count speed
         * @description 中文每分钟阅读字数
         * @default 300 (300 字/分钟)
         */
        cn: number
        /**
         * English word count speed
         * @description 英文每分钟阅读字数
         * @default 100 (200 字/分钟)
         */
        en: number
      }
    }
  }

  /**
   * @description Encrypt article
   * @description:zh-CN 加密文章
   * default algorithm: AES-CBC
   */
  encrypt: {
    enable: boolean
    /**
     * [encrypt](https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto/encrypt#%E6%94%AF%E6%8C%81%E7%9A%84%E7%AE%97%E6%B3%95)
     * @default AES-CBC
     */
    algorithm: string
    iv: Uint8Array
    salt: Uint8Array
    /**
     * @description:zh-CN 全局加密密码 todo
     */
    // password: string
  }

  /**
   * @description:en-US Limit the height of the code block in px
   * @description:zh-CN 限制代码块的高度，单位是 px
   */
  codeHeightLimit?: number

  /**
   * @description:en-US client redirect rules
   * @description:zh-CN 客户端重定向规则
   */
  redirects?: {
    useVueRouter?: boolean
    rules?: RedirectRule[]
  }
}

export type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends object ? PartialDeep<T[P]> : T[P]
}

/**
 * config generated by runtime
 */
export interface RuntimeConfig {
  addons: Record<string, ValaxyAddon>
  redirects: {
    useVueRouter: boolean
    redirectRoutes: RouteRecordRaw[]
  }
}

export interface Pkg {
  name: string
  version: string
  homepage?: string
  [key: string]: any
}

export interface ValaxyConfig<ThemeConfig = DefaultTheme.Config> {
  /**
   * @en Site **info** config. This affects info displayed on the site, and is independent of themes.
   * @zh 站点**信息**配置，这部分内容面向站点展示，且在不同主题中也是通用的格式
   * @see [站点配置 | Valaxy](https://valaxy.site/guide/config#%E7%AB%99%E7%82%B9%E9%85%8D%E7%BD%AE)
   * @see [Site Config | Valaxy](https://valaxy.site/guide/config#site-config)
   */
  siteConfig: SiteConfig
  /**
   * The name of theme
   * @description 主题名称
   * @see 主题橱窗 [Valaxy Themes Gallery](https://valaxy.site/themes/gallery)
   * @see 如何编写主题？ [How to write a theme? | Valaxy](https://valaxy.site/themes/write)
   * @see [默认 Yun 主题示例](https://yun.valaxy.site/)
   */
  theme: string
  /**
   * The config of theme
   * @zh 请参考对应主题的相关文档
   * @description 主题配置
   * @see [默认 Yun 主题文档](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/docs/README.md)
   */
  themeConfig: ThemeConfig & {
    pkg: Pkg
  }
  /**
   * @en Generated in runtime, do not modify manually
   * @zh 在运行时生成，请勿手动修改
   */
  runtimeConfig: RuntimeConfig
}

/**
 * user site config
 */
export type UserSiteConfig = PartialDeep<SiteConfig>

/**
 * Valaxy User Config
 * @description Valaxy 用户配置
 */
export type UserValaxyConfig<ThemeConfig = DefaultTheme.Config> = PartialDeep<ValaxyConfig<ThemeConfig>>
