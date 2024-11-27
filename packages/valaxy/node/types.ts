import type Vue from '@vitejs/plugin-vue'

import type { Hookable } from 'hookable'
import type { PluginVisualizerOptions } from 'rollup-plugin-visualizer'
import type { presetAttributify, presetIcons, presetTypography, presetUno } from 'unocss'
import type { VitePluginConfig as UnoCSSConfig } from 'unocss/vite'

import type Components from 'unplugin-vue-components/vite'
import type Markdown from 'unplugin-vue-markdown/vite'
import type { EditableTreeNode } from 'unplugin-vue-router'
import type Router from 'unplugin-vue-router/vite'
import type { DefaultTheme, PartialDeep, ValaxyAddon, ValaxyConfig } from 'valaxy/types'
import type { UserConfig as ViteUserConfig } from 'vite'
import type Layouts from 'vite-plugin-vue-layouts'
import type { ResolvedValaxyOptions } from './options'
import type { MarkdownOptions } from './plugins/markdown/types'

export type ValaxyNodeConfig<ThemeConfig = DefaultTheme.Config> = ValaxyConfig<ThemeConfig> & ValaxyExtendConfig
export type UserValaxyNodeConfig<ThemeConfig = DefaultTheme.Config> = PartialDeep<ValaxyNodeConfig<ThemeConfig>>
/**
 * fn with options for theme config
 */
export type ValaxyConfigFn<ThemeConfig = DefaultTheme.Config> = (options: ResolvedValaxyOptions<ThemeConfig>) => ValaxyNodeConfig | Promise<ValaxyNodeConfig>
export type ValaxyConfigExport<ThemeConfig = DefaultTheme.Config> = ValaxyNodeConfig<ThemeConfig> | ValaxyConfigFn<ThemeConfig>

export type HookResult = Promise<void> | void

export interface ValaxyHooks {
  'options:resolved': () => HookResult
  'config:init': () => HookResult
  /**
   * @see valaxy/node/plugins/vueRouter.ts extendRoute
   */
  'vue-router:extendRoute': (route: EditableTreeNode) => HookResult

  'build:before': () => HookResult
  'build:after': () => HookResult
}

export interface ValaxyNode {
  version: string

  hooks: Hookable<ValaxyHooks>
  hook: ValaxyNode['hooks']['hook']

  options: ResolvedValaxyOptions
}

export interface ValaxyExtendConfig {
  /**
   * Don't fail builds due to dead links.
   *
   * @default false
   * @deprecated use `build.ignoreDeadLinks` instead
   */
  ignoreDeadLinks?:
    | boolean
    | 'localhostLinks'
    | (string | RegExp | ((link: string) => boolean))[]

  /**
   * options for `valaxy build`
   */
  build: {
    /**
     * Don't fail builds due to dead links.
     * @zh 忽略死链
     * @default false
     */
    ignoreDeadLinks?:
      | boolean
      | 'localhostLinks'
      | (string | RegExp | ((link: string) => boolean))[]
    /**
     * Enable SSG for pagination
     * @en When enabled, it will generate pagination pages for you. `/page/1`, `/page/2`, ...
     * @zh 启用 SSG 分页，将单独构建分页页面 `/page/1`, `/page/2`, ...
     * @default false
     */
    ssgForPagination: boolean
  }

  /**
   * @experimental
   * Deploy to gh-pages/remote server
   */
  deploy: {
    /**
     * @zh 部署类型
     * @en deploy type
     */
    type?: 'gh-pages' | 'remote'
  }

  /**
   * internal modules
   */
  modules: {
    rss: {
      /**
       * enable rss
       */
      enable: boolean
      /**
       * @zh 全文输出
       * @en full text output
       * @default false
       */
      fullText: boolean
    }
  }

  /**
   * Markdown Feature
   */
  features: {
    /**
     * enable katex for global
     * @see [Example | Valaxy](https://valaxy.site/examples/katex)
     * @see https://katex.org/
     */
    katex: boolean
  }
  /**
   * vite.config.ts options
   * @see https://vite.dev/
   */
  vite?: ViteUserConfig
  /**
   * @vitejs/plugin-vue options
   * @see https://github.com/vitejs/vite-plugin-vue/blob/main/packages/plugin-vue/README.md
   */
  vue?: Parameters<typeof Vue>[0] & {
    isCustomElement?: ((tag: string) => boolean)[]
  }
  /**
   * @see https://github.com/unplugin/unplugin-vue-components
   */
  components?: Parameters<typeof Components>[0]
  /**
   * @see https://github.com/JohnCampionJr/vite-plugin-vue-layouts
   */
  layouts?: Parameters<typeof Layouts>[0]
  /**
   * @see https://github.com/posva/unplugin-vue-router
   */
  router?: Parameters<typeof Router>[0]
  /**
   * @see https://unocss.dev/config/
   */
  unocss?: UnoCSSConfig
  /**
   * rollup-plugin-visualizer
   * @see https://github.com/btd/rollup-plugin-visualizer
   */
  visualizer?: PluginVisualizerOptions
  /**
   * unocss presets
   * @see https://unocss.dev/guide/presets
   */
  unocssPresets?: {
    uno?: Parameters<typeof presetUno>[0]
    attributify?: Parameters<typeof presetAttributify>[0]
    icons?: Parameters<typeof presetIcons>[0]
    typography?: Parameters<typeof presetTypography>[0]
  }
  fuse?: {
    /**
     * @en_US Extends the metadata fields returned by the search
     * @zh_CN 扩展搜索返回的元数据字段
     * @default []
     * @description:en-US By default, returns the following fields: title, tags, categories, author, excerpt, link
     * @description:zh-CN 默认返回以下字段：title、tags、categories、author、excerpt、link
     */
    extendKeys?: string[]
  }
  /**
   * @experimental
   * Enable Vue Devtools & Valaxy Devtools
   * @see https://devtools-next.vuejs.org/
   */
  devtools?: boolean
  /**
   * @en config for markdown (include markdown-it plugins)
   * @zh markdown 相关配置
   * {@link MarkdownOptions}
   */
  markdown?: MarkdownOptions & Parameters<typeof Markdown>[0]
  /**
   * @en Extend markdown, you can modify the markdown content/excerpt
   * @zh 扩展 markdown
   */
  extendMd?: (ctx: {
    route: EditableTreeNode
    data: Readonly<Record<string, any>>
    content: string
    excerpt?: string
    path: string
  }) => void
  /**
   * @en Addons system
   * @zh 插件系统
   * @see 为什么需要插件？ [Why Addon? | Valaxy](https://valaxy.site/addons/why)
   * @see 插件橱窗 [Addons Gallery | Valaxy](https://valaxy.site/addons/gallery)
   * @example
   * ```ts
   * import { defineValaxyConfig } from 'valaxy'
   * import { addonTest } from 'valaxy-addon-test'
   *
   * export default defineValaxyConfig({
   *   addons: [
   *     // we always recommend to use function, so that you can pass options
   *     addonTest(),
   *   ]
   * })
   * ```
   */
  addons?: ValaxyAddons

  /**
   * @en Hooks system, you can customize each stage of the lifecycle.
   * @zh 钩子系统，你可以对生命周期的各个阶段进行定制。
   * @see https://valaxy.site/guide/custom/hooks
   */
  hooks?: Partial<ValaxyHooks>
}

export type ValaxyAddonLike = ValaxyAddon | false | null | undefined
export type ValaxyAddons = (ValaxyAddon | string)[] | Record<string, ValaxyAddonLike>

export type ValaxyAddonFn<ThemeConfig = DefaultTheme.Config> = (addonOptions: ValaxyAddonResolver, valaxyOptions: ResolvedValaxyOptions<ThemeConfig>) => ValaxyNodeConfig | Promise<ValaxyNodeConfig>
export type ValaxyAddonExport<ThemeConfig = DefaultTheme.Config> = ValaxyNodeConfig<ThemeConfig> | ValaxyAddonFn<ThemeConfig>

export interface ValaxyAddonResolver {
  name: string
  root: string
  enable: boolean
  global: boolean
  props: Record<string, any>
  options: Record<string, any>
  configFile?: string
  pkg: Record<string, any>

  setup?: (node: ValaxyNode) => void
}
