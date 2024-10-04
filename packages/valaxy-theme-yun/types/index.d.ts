import type { DefaultTheme } from 'valaxy/types'

export namespace YunTheme {
  export type Config = ThemeConfig
  export type Sidebar = any

  export interface Banner {
    /**
     * 是否启用
     */
    enable: boolean
    /**
     * @en Banner title
     * @zh 标题，默认每个字分割，你也可以通过数组的方式来自定义分割，如 ['Hello', 'World']
     */
    title: string | string[]

    /**
     * 首页下方的动态云
     * If you want change color of cloud, please change css var `--yun-c-cloud`
     */
    cloud?: {
      enable: boolean
    }
  }
}

export interface PageProps {
  name: string
  /**
   * @description:en-US Page URL
   * @description:zh-CN 页面链接
   */
  url: string
  /**
   * @see https://valaxy.site/guide/features#icones
   * @description:en-US Icon of page
   * @description:zh-CN 页面图标
   */
  icon: string
  /**
   * @description:en-US Color of icon
   * @description:zh-CN 图标颜色
   */
  color: string
}

/**
 * Theme Config
 */
export interface ThemeConfig extends DefaultTheme.Config {
  /**
   * toc title
   * @default 'On this page'
   */
  outlineTitle: string

  /**
   * @zh 配色
   */
  colors: {
    /**
     * @en primary color
     *
     * @zh 主题色
     * @default '#0078E7'
     */
    primary: string
  }

  /**
   * 首页标语
   */
  banner: YunTheme.Banner

  /**
   * @en Background image
   * @zh 背景图
   */
  bg_image: {
    /**
     * @en Enable background image
     */
    enable: boolean
    /**
     * @en Image url
     */
    url?: string
    /**
     * @en Image url when dark mode
     */
    dark?: string
    /**
     * @en Image opacity
     */
    opacity?: number
  }

  /**
   * @en
   * say something
   *
   * @zh 说点什么
   * - 自定义 API 链接，如 https://el-bot-api.elpsy.cn/api/words/young
   * 你可以通过在 public 下新建 json 的方式来使用, 如 public/young.json
   * ["Hello, World!", "Bye, World!"]
   */
  say: {
    /**
     * @default false
     */
    enable: boolean
    api: string
    hitokoto: {
      enable: boolean
      api: string
    }
  }

  /**
   * 公告
   */
  notice: {
    enable: boolean
    /**
     * @en Hide in /pages/[page]
     * @zh 在 /pages/[page] 中隐藏
     */
    hideInPages?: boolean
    content: string
  }

  /**
   * @en - Fireworks when click
   * @zh - 点击时的烟花效果
   */
  fireworks: {
    enable: boolean
    /**
     * @en - Fireworks colors
     * @zh - 烟花颜色
     * @default ['#66A7DD', '#3E83E1', '#214EC2']
     */
    colors?: string[]
  }

  /**
   * nav items
   * @zh 导航栏 位于页面右上角
   */
  nav: NavItem[]
  /**
   * @en - Pages
   * @zh - 页面，显示在社交导航栏下方
   */
  pages: PageProps[]

  sidebar: YunTheme.Sidebar

  /**
   * footer
   */
  footer: Partial<{
    /**
     * 建站于
     */
    since: number

    /**
     * Icon between year and copyright info.
     */
    icon: Partial<{
      /**
       * icon name, i-xxx
       */
      enable: boolean
      name: string
      animated: boolean
      color: string
      url: string
      title: string
    }>

    /**
     * Powered by valaxy & valaxy-theme-${name}, default is yun
     */
    powered: boolean

    /**
     * Chinese Users | 中国用户
     * 备案 ICP
     * 国内用户需要在网站页脚展示备案 ICP 号
     * https://beian.miit.gov.cn/
     */
    beian: {
      enable: boolean
      /**
       * 苏ICP备xxxxxxxx号
       */
      icp: string
    }
  }>

  /**
   * @en Custom Post Card Types
   * @zh 自定义文章卡片类型
   */
  types: Record<string, {
    color: string
    icon: string
  }>

  /**
   * @en Menu Bar
   * @zh 菜单栏
   */
  menu: {
    /**
     * @zh 最右侧的导航图标
     */
    custom: {
      title: string
      url: string
      icon: string
    }
  }
}

export type UserThemeConfig = Partial<ThemeConfig>

/**
 * For user links
 */
export interface LinkType {
  avatar: string
  name: string
  url: string
  color: string
  blog: string
  desc: string
}

export interface NavItemLink {
  icon?: string
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
 * girl
 */
export interface GirlType {
  name: string
  url: string
  avatar: string
  from?: string
  reason?: string
}

export * from '../composables'
export * from './projects'
