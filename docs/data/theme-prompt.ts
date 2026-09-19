export type ThemePromptLocale = 'en' | 'zh'

export interface ThemePromptOptions {
  name: string
  visualDirection: string
  features: string
  workspace?: 'existing' | 'starter'
  designSystem?: 'custom' | 'ak-ui'
}

/** Normalize a theme package suffix; reject names unsafe for scaffold commands. */
export function normalizeThemeName(name: string): string {
  const value = name.trim().replace(/^valaxy-theme-/, '')
  return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value) && value.length <= 60 ? value : ''
}

function getValue(value: string, fallback: string) {
  return value.trim() || fallback
}

/** A per-project brief: the installed Skill owns the reusable engineering workflow. */
export function createThemeBrief(locale: ThemePromptLocale, options: ThemePromptOptions) {
  const zh = locale === 'zh'
  const workspace = options.workspace === 'starter'
    ? (zh ? '从官方 valaxyjs/valaxy-theme-starter 模板创建独立主题工作区，保留 theme/ + demo/ 结构。' : 'Create an independent workspace from valaxyjs/valaxy-theme-starter, keeping theme/ + demo/.')
    : (zh ? '修改当前工作区的现有主题与 demo，保留已有包名、目录和功能；仅在我明确要求时重命名。' : 'Evolve the existing theme and demo in this workspace. Preserve package names, directories and working features; rename only when explicitly requested.')
  const foundation = options.designSystem === 'ak-ui'
    ? (zh ? 'AK UI（https://ak-ui.yyj.moe/），按 Skill 的 AK UI recipe 接入。' : 'AK UI (https://ak-ui.yyj.moe/); use the Skill’s AK UI recipe.')
    : (zh ? '自定义风格，沿用项目中适合的组件与样式工具。' : 'Custom style; reuse suitable components and styling tools in the project.')

  return zh
    ? `请使用 valaxy-theme Skill 实现以下主题设计。如果 Skill 不可用，请先说明，并让我提供完整提示词或安装 Skill。

${createProjectInput(locale, options)}
- 工作方式：${workspace}
- 设计基础：${foundation}

先检查工作区，再按 Skill 完成实现与相关验证。保留我填写的设计方向，缺少非关键细节时自行选择合理默认值。把最终主题、可运行的 demo 和验证结果交付给我。`
    : `Use the valaxy-theme Skill to implement this design. If the Skill is unavailable, say so first so I can provide the standalone prompt or install the Skill.

${createProjectInput(locale, options)}
- Workspace: ${workspace}
- Design foundation: ${foundation}

Inspect the workspace, then implement and verify following the Skill. Preserve my design direction and choose sensible defaults for nonessential missing details. Deliver the theme, a working demo and verification results.`
}

function createProjectInput(locale: ThemePromptLocale, options: ThemePromptOptions) {
  const name = normalizeThemeName(options.name) || '[name]'
  return locale === 'zh'
    ? `主题设计：
- 包名：valaxy-theme-${name}
- 视觉方向：${getValue(options.visualDirection, '[描述配色、字体、布局与参考风格]')}
- 所需页面与功能：${getValue(options.features, '[列出页面与交互]')}`
    : `Theme design:
- Package: valaxy-theme-${name}
- Visual direction: ${getValue(options.visualDirection, '[Describe colors, typography, layout and references]')}
- Required pages and features: ${getValue(options.features, '[List pages and interactions]')}`
}

/** Self-contained fallback for assistants without Skill support. */
export function createThemePrompt(locale: ThemePromptLocale, options: ThemePromptOptions) {
  const name = normalizeThemeName(options.name) || '[name]'
  const bootstrap = createThemeBootstrap(locale, name, options)
  const input = createProjectInput(locale, options)
  if (locale === 'zh') {
    return `请实现一个可运行、可维护的 Valaxy 主题包及其 demo。此提示词可独立使用，无需安装 Skill。

${input}

${bootstrap}

开发依据：
- 先检查工作区、适用的 AGENTS.md、package.json 脚本，以及已安装 Valaxy 的版本、导出和类型。使用 pnpm，以当前源码和 https://valaxy.site/zh/themes/write 为准，不虚构 API。
- 仅修改目标主题及验证所需的 demo；迭代现有主题时保留用户的内容、目录、功能和包名，除非用户要求更改。不为小改动重新搭建工作区。
- 如主题名仍是占位符，在执行初始化前确认；非关键设计细节自行选择合理默认值。

实现：
1. 沿用 starter 的 theme/ 与 demo/。主题以源码分发，按需使用 components/、layouts/、pages/、styles/、setup/、client/ 和 types/，不要求无用途的空目录。
2. 用 defineTheme() 定义实际实现的配置项、类型和默认值；站点身份与文章内容由消费者配置，文章列表读取框架真实数据。
3. components/ValaxyMain.vue 通过 ValaxyMd 渲染内容并保留插槽；遵循当前版本的 frontmatter、RouterView 和布局协议。data?: PageData 可能未传入，不依赖 data.headers；目录需要 useOutline() 时放在独立子组件中，避免触发 Markdown 更新循环。
4. Vue 使用 <script setup lang="ts">，按页面职责拆分组件。setup/main.ts 用 defineAppSetup() 接入公共样式与客户端初始化；主题 styles/index.ts 由框架发现，每份样式只保留一个入口。用已验证的 --va-* 变量和真实样式路径。
5. 首页与阅读页一起设计：语义化 HTML、键盘操作与焦点、移动端、长标题、代码块、表格、图片和空状态；深浅色模式如有实现需同步检查。不要依赖未守卫的浏览器全局对象。
6. 将真实运行时依赖放进主题包，明确 Valaxy/Vue peer 兼容性，保持 package.json 导出与源码一致。不要依赖开发者本机路径或工作区外的 link: 包。README 说明安装、配置、布局与开发命令。

验证与交付：
- 查看真实脚本，运行 pnpm lint、pnpm typecheck 与相关测试的现有等价命令。检查 pnpm build 是否执行 SSG；Valaxy 默认构建可能是 SPA，必要时明确使用 valaxy build --ssg。
- 用真实文章、草稿、长标题验证首页、文章、普通页面和空状态；生产列表排除草稿。检查桌面/窄屏、键盘、页面跳转、目录与控制台，确认没有 hydration 错误。
- 新主题或依赖/导出变更时，pnpm pack 后在独立临时消费站点安装归档并构建；涉及子路径部署时测试非根 base。单纯视觉微调不必重复无关检查。
- 直接完成实现，汇报实际验证结果与未完成项。发布或部署遵从用户明确指令。`
  }

  return `Implement a runnable, maintainable Valaxy theme package and its demo. This prompt is self-contained; no Skill installation is required.

${input}

${bootstrap}

Sources of truth:
- Inspect the workspace, applicable AGENTS.md, package.json scripts and installed Valaxy version, exports, type declarations, and theme development documentation. Use pnpm and https://valaxy.site/themes/write. Confirm APIs instead of inventing an API.
- Change only the target theme and its verification demo. For existing themes, preserve content, directories, working features and package names unless asked to change them. Do not re-scaffold for a small iteration.
- Resolve a placeholder package name before initialization. Choose sensible defaults for nonessential design details.

Implementation:
1. Follow the starter’s theme/ and demo/ structure. Distribute theme source with components/, layouts/, pages/, styles/, setup/, client/ and types/ as needed; do not add unused directories.
2. Use defineTheme() for implemented options, types and defaults. Keep site identity and content configurable, and read real posts from framework APIs.
3. Render content through ValaxyMd in components/ValaxyMain.vue and preserve slots. Follow the installed frontmatter, RouterView and layout contracts. Optional data?: PageData may be absent; do not rely on data.headers. Put useOutline() in a dedicated child to avoid Markdown update loops.
4. Use Vue <script setup lang="ts"> and focused components. Use defineAppSetup() in setup/main.ts for public styles and client setup; styles/index.ts is discovered by the framework. Give each stylesheet a single entrypoint and verify --va-* variables and import paths.
5. Design home and reading pages together: semantic HTML, keyboard/focus support, mobile, long titles, code, tables, images and empty states. Check light/dark modes when implemented. Guard browser-only globals for SSR.
6. Declare runtime dependencies in the theme, specify Valaxy/Vue peer compatibility, and align package exports with source. Avoid developer-local paths or external link: dependencies. Document installation, configuration, layouts and commands.

Verification and delivery:
- Inspect real scripts and run available equivalents of pnpm lint, pnpm typecheck and relevant tests. Confirm pnpm build actually runs SSG; Valaxy may default to SPA, so use valaxy build --ssg explicitly when needed.
- Verify home, post, ordinary and empty pages using real content, a draft and a long title. Exclude drafts in production. Check desktop/mobile, keyboard navigation, links, outline and console/hydration errors.
- For new themes or dependency/export changes, pnpm pack and build a fresh temporary consumer with the archive installed. Test a non-root base for subdirectory hosting changes. Do not repeat unrelated checks for a small visual edit.
- Complete implementation and report actual verification and remaining gaps. Publish or deploy only as instructed by the user.`
}

/** Build the workspace and optional design-library instructions for an authoring brief. */
function createThemeBootstrap(locale: ThemePromptLocale, name: string, options: ThemePromptOptions): string {
  const zh = locale === 'zh'
  const lines = [zh ? '开始方式：' : 'Getting started:']
  if (options.workspace === 'starter') {
    lines.push(zh
      ? `- 在新的空目录创建独立主题工作区。先检查是否已有目标目录；已有内容时继续使用或询问，不要覆盖。模板来自 https://github.com/valaxyjs/valaxy-theme-starter。`
      : '- Create a standalone theme workspace in a new directory. Inspect an existing target before proceeding; do not overwrite it. Use https://github.com/valaxyjs/valaxy-theme-starter.')
    lines.push(`- pnpm dlx degit valaxyjs/valaxy-theme-starter valaxy-theme-${name}`)
    lines.push(`- cd valaxy-theme-${name}`)
    lines.push(zh
      ? `- 模板采用 theme/ + demo/ 结构。检查 package.json：若存在 theme:init，执行 pnpm theme:init ${name}；否则同步修改包名、workspace 依赖、组件命名空间和 demo 的 theme 配置。然后 pnpm install。`
      : `- The starter uses theme/ + demo/. Inspect package.json: if theme:init exists, run pnpm theme:init ${name}; otherwise update package names, workspace references, component namespaces and the demo theme together. Then run pnpm install.`)
  }
  else {
    lines.push(zh ? '- 在现有工作区中找到主题与 demo，沿用它们的目录、脚本和约定。' : '- Find the existing theme and demo in this workspace and preserve their directories, scripts and conventions.')
  }
  if (options.designSystem === 'ak-ui') {
    lines.push(zh
      ? '- 若使用 AK UI 1.1 的 /site 移动菜单等控制器，阅读其当前 Skill 的 site.md，挂载后初始化并在卸载时 destroy()；验证键盘焦点、减少动态效果与无 JavaScript 回退。'
      : '- For AK UI 1.1 /site controllers such as mobile menus, read the current Skill’s site.md, initialize after mounting and destroy() on unmount. Verify keyboard focus, reduced motion and no-JavaScript fallback.')
    lines.push(zh ? '\nAK UI 设计约束：' : '\nAK UI design contract:')
    lines.push(zh
      ? '- 参考 https://ak-ui.yyj.moe/；可搭配 pnpm dlx skills add YunYouJun/ak-ui --skill ak-ui。采用 system 强度，保留博客品牌与阅读舒适度。'
      : '- Read https://ak-ui.yyj.moe/; optionally install pnpm dlx skills add YunYouJun/ak-ui --skill ak-ui. Use system intensity and preserve the blog identity and comfortable reading.')
    lines.push(zh
      ? '- 核对 @yunyoujun/ak-ui 的当前版本，将依赖安装在主题包中。使用 .ak-* 基础样式时引入 @yunyoujun/ak-ui/style.css；仅用设计 Token 时引入 tokens.css。它不是可直接 import Vue 组件的运行时组件库。'
      : '- Verify the current @yunyoujun/ak-ui version and install it in the theme package. Import @yunyoujun/ak-ui/style.css for .ak-* primitives or tokens.css for tokens only. It is not a runtime Vue component library.')
    lines.push(zh
      ? '- 将配置映射到 --ak-* 语义 Token，使用原创几何、克制的信号色、实际文章元数据和清晰的正文排版；不复制游戏素材。检查深浅色、键盘焦点和移动端。'
      : '- Map configuration to semantic --ak-* tokens. Use original geometry, restrained signals, actual post metadata and legible prose. Do not copy game assets. Check both appearances, keyboard focus and mobile layouts.')
  }
  return lines.join('\n')
}
