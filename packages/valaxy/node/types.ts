import type Vue from '@vitejs/plugin-vue'

import type Components from 'unplugin-vue-components/vite'
import type Layouts from 'vite-plugin-vue-layouts'
import type Markdown from 'unplugin-vue-markdown/vite'
import type Router from 'unplugin-vue-router/vite'

import type { VitePluginConfig as UnoCSSConfig } from 'unocss/vite'
import type { EditableTreeNode } from 'unplugin-vue-router'
import type { UserConfig as ViteUserConfig } from 'vite'
import type { presetAttributify, presetIcons, presetTypography, presetUno } from 'unocss'
import type { Hookable } from 'hookable'
import type { DefaultTheme, PartialDeep, ValaxyAddon, ValaxyConfig } from 'valaxy/types'
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

  build: {
    /**
     * Don't fail builds due to dead links.
     *
     * @default false
     */
    ignoreDeadLinks?:
      | boolean
      | 'localhostLinks'
      | (string | RegExp | ((link: string) => boolean))[]
    /**
     * Enable SSG for pagination
     * @default false
     * When enabled, it will generate pagination pages for you.
     * `/page/1`, `/page/2`, ...
     */
    ssgForPagination: boolean
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
     */
    katex: boolean
  }

  vite?: ViteUserConfig
  /**
   * @vitejs/plugin-vue options
   * @see https://github.com/vitejs/vite-plugin-vue/blob/main/packages/plugin-vue/README.md
   */
  vue?: Parameters<typeof Vue>[0] & {
    isCustomElement?: ((tag: string) => boolean)[]
  }
  // unplugin
  components?: Parameters<typeof Components>[0]
  layouts?: Parameters<typeof Layouts>[0]
  router?: Parameters<typeof Router>[0]

  unocss?: UnoCSSConfig
  /**
   * unocss presets
   */
  unocssPresets?: {
    uno?: Parameters<typeof presetUno>[0]
    attributify?: Parameters<typeof presetAttributify>[0]
    icons?: Parameters<typeof presetIcons>[0]
    typography?: Parameters<typeof presetTypography>[0]
  }
  /**
   * @experimental
   * Enable Vue Devtools & Valaxy Devtools
   * @see https://devtools-next.vuejs.org/
   */
  devtools?: boolean
  /**
   * for markdown
   */
  markdown?: MarkdownOptions & Parameters<typeof Markdown>[0]
  extendMd?: (ctx: {
    route: EditableTreeNode
    data: Readonly<Record<string, any>>
    content: string
    excerpt?: string
    path: string
  }) => void
  addons?: ValaxyAddons

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
