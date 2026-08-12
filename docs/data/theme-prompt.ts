export type ThemePromptLocale = 'en' | 'zh'

export interface ThemePromptOptions {
  name: string
  visualDirection: string
  features: string
}

function getThemeName(name: string) {
  return name.trim().replace(/^valaxy-theme-/, '') || '[name]'
}

function getValue(value: string, fallback: string) {
  return value.trim() || fallback
}

export function createThemePrompt(locale: ThemePromptLocale, options: ThemePromptOptions) {
  const themeName = getThemeName(options.name)

  if (locale === 'zh') {
    const visualDirection = getValue(options.visualDirection, '[描述视觉方向、配色、字体与参考风格]')
    const features = getValue(options.features, '[列出所需布局、页面与功能]')

    return `你是一名 Valaxy 主题开发者。请在当前项目中实现一个最小可运行、可继续扩展的 Valaxy 主题包。

项目输入：
- 包名：valaxy-theme-${themeName}
- 视觉方向：${visualDirection}
- 所需页面与功能：${features}

如果以上任一方括号占位符仍未替换，请先提出简短、聚焦的问题，确认后再修改文件。

范围与依据：
- 只修改主题包，以及仓库约定中验证该主题所必需的现有示例；不要生成无关站点、插件或部署配置。
- 全程使用 pnpm，并遵守仓库内适用的 AGENTS.md 与现有代码风格。
- 优先以当前仓库的主题 starter、custom demo 或结构最接近的现有主题为基线，不要凭空重建约定。
- 编码前检查当前安装的 Valaxy 版本、导出、类型声明与主题开发文档。只能使用可在当前版本源码或类型中确认的 API；无法确认时先搜索或询问，不要虚构。

从以下最小结构开始，并按现有 starter 调整：

valaxy-theme-${themeName}/
├── package.json
├── index.ts
├── valaxy.config.ts
├── client/index.ts
├── components/
│   ├── layout.vue
│   └── ValaxyMain.vue
├── layouts/
│   ├── default.vue
│   ├── home.vue
│   └── post.vue
├── setup/main.ts
├── styles/index.scss
├── types/index.d.ts
└── README.md

仅在需求或当前 starter 确有需要时再增加 App.vue、node/、pages/、locales/、composables/、stores/ 或额外布局。

实现约定：
1. 在 valaxy.config.ts 中使用当前版本导出的 defineTheme() 声明带类型的默认 themeConfig；仅暴露主题实际实现的配置项。
2. 在 setup/main.ts 中使用 defineAppSetup() 加载主题样式；需要 Valaxy 公共样式时按当前文档的真实导入路径引入。
3. components/ValaxyMain.vue 接收 frontmatter: Post 与可选 data?: PageData，通过 ValaxyMd 渲染 Markdown，并保留主题扩展所需的插槽。
4. default、home、post 布局应可用；RouterView、Layout 与插槽的组合遵循当前 starter，不发明新的布局协议。
5. Vue 组件使用 Vue 3 Composition API、<script setup lang="ts"> 和语义化 HTML；交互支持键盘、可见焦点与合理的 aria 属性，并兼顾响应式布局。
6. 全局主题与 Markdown 样式放在 styles/，组件私有样式使用 scoped。优先复用现有 --va-* CSS 变量；同时检查浅色/深色对比度。动态 UnoCSS 类只有在确有需要时才加入 safelist。
7. package.json、index.ts、client/index.ts 与 types/ 的导出保持一致；只声明代码实际导入的依赖，并遵循当前 starter 的 peer/dev dependency 约定。
8. README 说明安装方式、站点 valaxy.config.ts 中的 theme 名称、theme.config.ts 配置示例、支持的布局和开发命令。

验证：
- 先查看 package.json 中真实存在的脚本，再使用 pnpm 运行最接近 pnpm lint、pnpm typecheck 和相关单测的命令；不要编造脚本。
- 让一个现有 Valaxy 示例站点选中该主题并执行其 pnpm build，确认 SSR/SSG 中没有直接访问仅浏览器可用的全局对象。
- 至少检查首页、文章页、默认页、Markdown 正文、窄屏，以及主题支持时的浅色/深色模式。
- 最后汇报改动文件、实际运行的命令与结果、未验证项和兼容性风险。请直接完成实现，不要只返回代码片段。`
  }

  const visualDirection = getValue(options.visualDirection, '[Describe the visual direction, colors, typography, and references]')
  const features = getValue(options.features, '[List the required layouts, pages, and features]')

  return `You are a Valaxy theme developer. In the current project, implement a minimal, runnable Valaxy theme package that is easy to extend.

Project input:
- Package: valaxy-theme-${themeName}
- Visual direction: ${visualDirection}
- Required pages and features: ${features}

If any bracketed placeholder above remains, ask concise, focused questions before changing files.

Scope and sources of truth:
- Change only the theme package and an existing example required by repository conventions to verify it. Do not generate an unrelated site, addon, or deployment configuration.
- Use pnpm throughout, and follow every applicable AGENTS.md file and the repository's existing style.
- Prefer the current repository's theme starter, custom demo, or closest existing theme as the baseline instead of recreating conventions from memory.
- Before coding, inspect the installed Valaxy version, exports, type declarations, and theme development documentation. Use only APIs confirmed in the current source or types; search or ask when uncertain instead of inventing an API.

Start with this minimal structure and adapt it to the current starter:

valaxy-theme-${themeName}/
├── package.json
├── index.ts
├── valaxy.config.ts
├── client/index.ts
├── components/
│   ├── layout.vue
│   └── ValaxyMain.vue
├── layouts/
│   ├── default.vue
│   ├── home.vue
│   └── post.vue
├── setup/main.ts
├── styles/index.scss
├── types/index.d.ts
└── README.md

Add App.vue, node/, pages/, locales/, composables/, stores/, or extra layouts only when the requirements or current starter justify them.

Implementation conventions:
1. In valaxy.config.ts, use defineTheme() exported by the current version to declare typed default themeConfig values. Expose only configuration that the theme actually implements.
2. In setup/main.ts, use defineAppSetup() to load theme styles. Import Valaxy common styles only through paths verified in the current documentation.
3. components/ValaxyMain.vue accepts frontmatter: Post and optional data?: PageData, renders Markdown through ValaxyMd, and preserves the slots needed for theme extension.
4. Make the default, home, and post layouts usable. Follow the current starter's RouterView, Layout, and slot composition instead of inventing a layout protocol.
5. Write Vue components with the Vue 3 Composition API, <script setup lang="ts">, and semantic HTML. Give interactions keyboard support, visible focus, and appropriate aria attributes, and make layouts responsive.
6. Put global theme and Markdown styles in styles/ and keep component-only styles scoped. Prefer existing --va-* CSS variables and check light/dark contrast. Safelist dynamic UnoCSS classes only when needed.
7. Keep package.json, index.ts, client/index.ts, and types/ exports aligned. Declare only dependencies imported by the code and follow the current starter's peer/dev dependency conventions.
8. In README, document installation, the theme name used by a site's valaxy.config.ts, theme.config.ts options, supported layouts, and development commands.

Validation:
- Inspect the real package.json scripts first, then use pnpm to run the closest available equivalents of pnpm lint, pnpm typecheck, and relevant unit tests. Do not invent scripts.
- Select the theme in an existing Valaxy example site and run that site's pnpm build. Confirm SSR/SSG code does not access browser-only globals directly.
- Check at least the home page, a post, a default page, Markdown content, a narrow viewport, and light/dark modes when supported.
- Finish by reporting changed files, commands and results, anything not verified, and compatibility risks. Implement the result rather than returning snippets only.`
}
