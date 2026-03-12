import type Vue from '@vitejs/plugin-vue'

import type { Hookable } from 'hookable'
import type { PluginVisualizerOptions } from 'rollup-plugin-visualizer'
import type { presetAttributify, presetIcons, presetTypography, presetWind4 } from 'unocss'
import type { VitePluginConfig as UnoCSSConfig } from 'unocss/vite'

import type Components from 'unplugin-vue-components/vite'
import type Markdown from 'unplugin-vue-markdown/vite'
import type { UserConfig as ViteUserConfig } from 'vite'
import type Layouts from 'vite-plugin-vue-layouts'
import type { groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import type { EditableTreeNode } from 'vue-router/unplugin'
import type Router from 'vue-router/vite'
import type { DefaultTheme, PartialDeep, ValaxyConfig } from '../../types'
import type { createValaxyNode } from '../app'
import type { MarkdownOptions } from '../plugins/markdown/types'

import type { ValaxyAddons } from './addon'
import type { ValaxyHooks } from './hook'
import type { ContentLoader } from './loader'

import type { ResolvedValaxyOptions } from './options'

/**
 * @experimental
 * A module to load from CDN instead of bundling
 */
export interface CdnModule {
  /**
   * npm package name to externalize
   * @example 'vue'
   */
  name: string
  /**
   * Global variable name the library exposes on `window`
   * Used for mapping imports to `window[global]`
   * @example 'Vue'
   */
  global: string
  /**
   * Full CDN URL to the UMD/IIFE script
   * @example 'https://cdn.jsdelivr.net/npm/vue@3.5.0/dist/vue.global.prod.js'
   */
  url: string
  /**
   * Optional CSS URL if the module requires stylesheet
   * @example 'https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css'
   */
  css?: string
  /**
   * Named exports to re-export from the global variable.
   * Required for libraries that use named exports (e.g., `import { ref } from 'vue'`).
   * @example ['ref', 'computed', 'watch', 'createApp']
   */
  exports?: string[]
}

export type ValaxyNodeConfig<ThemeConfig = DefaultTheme.Config> = ValaxyConfig<ThemeConfig> & ValaxyExtendConfig
export type UserValaxyNodeConfig<ThemeConfig = DefaultTheme.Config> = PartialDeep<ValaxyNodeConfig<ThemeConfig>>
/**
 * fn with options for theme config
 */
export type ValaxyConfigFn<ThemeConfig = DefaultTheme.Config> = (options: ResolvedValaxyOptions<ThemeConfig>) => ValaxyNodeConfig | Promise<ValaxyNodeConfig>
export type ValaxyConfigExport<ThemeConfig = DefaultTheme.Config> = ValaxyNodeConfig<ThemeConfig> | ValaxyConfigFn<ThemeConfig>

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
    /**
     * @en FOUC (Flash of Unstyled Content) guard configuration.
     * Prevents layout shift on first paint by hiding the page body until
     * full CSS is loaded. Uses `body { opacity: 0 }` inline, then the
     * main stylesheet sets `body { opacity: 1 }` to reveal content.
     *
     * @zh FOUC（无样式内容闪烁）防护配置。
     * 通过在完整 CSS 加载前隐藏页面内容来防止首屏样式闪烁。
     * 内联 `body { opacity: 0 }`，完整 CSS 加载后通过 `body { opacity: 1 }` 解锁显示。
     */
    foucGuard?: {
      /**
       * @en Enable FOUC guard. When disabled, no opacity hiding or fallback
       * scripts will be injected.
       * @zh 是否启用 FOUC 防护。禁用后不会注入 opacity 隐藏及兜底脚本。
       * @default true
       */
      enabled?: boolean
      /**
       * @en Maximum wait time (ms) before force-showing the page, as a safety
       * fallback in case CSS fails to load. Set to `0` to disable the timeout
       * fallback (only `window.onload` will trigger reveal).
       * @zh 最大等待时间（毫秒），作为 CSS 加载失败时的安全兜底。
       * 设置为 `0` 可禁用超时兜底（仅依赖 `window.onload` 触发显示）。
       * @default 5000
       */
      maxDuration?: number
    }
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
      /**
       * @zh 从构建后的 HTML 中提取图片路径（用于解析 Vite 打包后的 hash 文件名）
       * @en Extract image paths from built HTML files (to resolve Vite hashed filenames)
       * @default true
       */
      extractImagePathsFromHTML: boolean
    }
  }

  /**
   * Markdown Feature
   */
  features: {
    /**
     * enable katex for global
     *
     * - `true` (default): all pages render KaTeX, unless `frontmatter.katex: false`
     * - `false`: no pages render KaTeX by default, but individual pages can opt-in via `frontmatter.katex: true`
     *
     * @see [Example | Valaxy](https://valaxy.site/examples/katex)
     * @see https://katex.org/
     * @default true
     */
    katex: boolean
  }

  /**
   * Enable MathJax3 math rendering (aligned with VitePress `markdown.math`).
   *
   * When enabled, MathJax3 will be used via `markdown-it-mathjax3` to render
   * math formulas as self-contained SVG — no external CSS or fonts required.
   *
   * - `features.katex` and `math` are **mutually exclusive**.
   * - When `math` is enabled, `features.katex` is automatically ignored.
   * - `math` requires installing `markdown-it-mathjax3`: `pnpm add markdown-it-mathjax3`
   *
   * @see https://www.mathjax.org/
   * @default false
   */
  math: boolean
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
    /**
     * @valaxy
     */
    isCustomElement?: ((tag: string) => boolean)[]
    /**
     * @valaxy
     * @see https://cn.vuejs.org/guide/scaling-up/tooling#note-on-in-browser-template-compilation
     * enable
     *
     * for runtime compile vue, encrypt and decrypt
     * for excerpt_type: html (runtime render)
     *
     * @default true
     *
     * browserTemplateCompilation
     * @description 支持浏览器内的模板编译
     */
    browserTemplateCompilation?: boolean
  }
  /**
   * @see https://github.com/unplugin/unplugin-vue-components
   *
   * exclude @default components/.exclude
   */
  components?: Parameters<typeof Components>[0]
  /**
   * @see https://github.com/JohnCampionJr/vite-plugin-vue-layouts
   */
  layouts?: Parameters<typeof Layouts>[0]
  /**
   * @see https://router.vuejs.org/file-based-routing/
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
   * @see https://github.com/yuyinws/vitepress-plugin-group-icons
   */
  groupIcons?: Partial<NonNullable<Parameters<typeof groupIconVitePlugin>[0]>>
  /**
   * unocss presets
   * @see https://unocss.dev/guide/presets
   */
  unocssPresets?: {
    /**
     * @deprecated use wind4 instead
     */
    uno?: Parameters<typeof presetWind4>[0]
    attributify?: Parameters<typeof presetAttributify>[0]
    icons?: Parameters<typeof presetIcons>[0]
    typography?: Parameters<typeof presetTypography>[0]
    wind4?: Parameters<typeof presetWind4>[0]
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

  /**
   * @experimental
   * CDN externals configuration.
   * Specify modules to load from CDN instead of bundling them.
   * Only takes effect during `valaxy build`, not in dev mode.
   * @see https://github.com/YunYouJun/valaxy/issues/604
   */
  cdn?: {
    /**
     * Modules to load from CDN instead of bundling
     * @default []
     */
    modules?: CdnModule[]
  }

  /**
   * @experimental
   * Content loaders for fetching content from external CMS platforms.
   * Loaded content is written as .md files to `.valaxy/content/pages/`
   * and automatically integrated into the routing and markdown pipeline.
   * @see https://github.com/YunYouJun/valaxy/issues/294
   */
  loaders?: ContentLoader[]
}

export type ValaxyApp = ReturnType<typeof createValaxyNode>
