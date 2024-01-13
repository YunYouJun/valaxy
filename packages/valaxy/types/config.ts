import type { ZoomOptions } from 'medium-zoom'
import type { FuseOptions } from '@vueuse/integrations/useFuse'
import type { ILazyLoadOptions } from 'vanilla-lazyload'
import type { ValaxyAddon } from '../types'
import type { DefaultTheme } from './default-theme'
import type { PostFrontMatter } from './posts'
import type { FuseListItem } from './node'

import './default-theme'

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

export interface RedirectRule {
  to: string
  from: string | string[]
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
   * @description 默认语言
   * @default 'en'
   */
  lang: string
  /**
   * alternative languages
   * @description 可选语言
   * @default ['en', 'zh-CN']
   * @see https://ogp.me/#optional
   */
  languages: string[]
  /**
   * @see https://day.js.org/docs/en/plugin/timezone
   * @zh_CN 时区 'Asia/Shanghai' Recommended
   * @en_US timezone
   * @default '' Your Computer Timezone
   */
  timezone: string
  /**
   * You site url in web, required for ssg & rss
   * @description 站点的完整 URL，SSG & RSS 需要（譬如生成版权处文章永久链接）
   * @example 'https://valaxy.site'
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
    /**
     * Search Type
     * - algolia: Algolia Search
     * - engine: Engine Search, like Google/Baidu
     * - fuse: Local Search by fuse.js
     */
    type: 'algolia' | 'engine' | 'fuse'
  }

  /**
   *
   * fuse search
   * @see https://fusejs.io/
   * @description 本地搜索
   * Please set search.type to 'fuse'
   */
  fuse: {
    /**
     * @default 'valaxy-fuse-list.json'
     * @description 搜索结果列表数据所在路径
     */
    dataPath: string
    /**
     * @see https://fusejs.io/api/options.html
     */
    options: FuseOptions<FuseListItem> & {
      /**
       * @default ['title', 'tags', 'categories', 'excerpt']
       * @description 搜索的字段
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
    enable: boolean
    /**
     * For example: '.markdown-body img'
     * @default '' content.value querySelectorAll('img')
     */
    selector: string | HTMLElement | HTMLElement[]
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
  redirects?: RedirectRule[]
}

export type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends object ? PartialDeep<T[P]> : T[P]
}

/**
 * config generated by runtime
 */
export interface RuntimeConfig {
  addons: Record<string, ValaxyAddon>
}

export interface ValaxyConfig<ThemeConfig = DefaultTheme.Config> {
  siteConfig: SiteConfig
  /**
   * The name of theme
   * @description 主题名称
   */
  theme: string
  /**
   * The config of theme
   * @description 主题配置
   */
  themeConfig: ThemeConfig & {
    pkg: {
      name: string
      version: string
      homepage?: string
      [key: string]: any
    }
  }
  /**
   * generated by runtime
   */
  runtimeConfig: RuntimeConfig

  // other in node
  /**
   * Don't fail builds due to dead links.
   *
   * @default true
   */
  ignoreDeadLinks: boolean
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
