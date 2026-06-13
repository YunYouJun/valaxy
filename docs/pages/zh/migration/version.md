---
title: 版本迁移
categories:
  - migration
top: 8
---

## v1.0.0 {#v100}

v1.0.0 是首个稳定版本，包含若干破坏性变更，主要是移除长期已弃用的选项。大多数博客无需改动；若你使用过下列功能，请对照检查。

### Node.js：最低版本升至 `>=22.12.0` {#nodejs-version}

Valaxy 现在要求 Node.js `>=22.12.0`（此前为 `^18 || >=20`）。这是由 `unplugin-vue-markdown@32`（要求 Node `>=22`）与 Vite 8（`^20.19.0 || >=22.12.0`）共同决定的——在 Node 22 分支上最低需要 `22.12.0`。**不再支持 Node 18 与 20。** 更新前请先升级本地、CI 与部署环境的 Node 版本（见 [#710](https://github.com/YunYouJun/valaxy/pull/710)）。

### SSG：移除传统 `vite-ssg` 引擎 {#ssg-remove-vite-ssg}

基于 JSDOM 的 `vite-ssg` SSG 引擎已被移除（它在 pnpm 下损坏，详见 [#706](https://github.com/YunYouJun/valaxy/issues/706)）。现在只有单一的内置 Valaxy SSG 引擎。

- `--ssg-engine` 命令行参数与 `build.ssg.engine` 配置项均已移除——直接运行 `valaxy build --ssg` 即可。
- `vite.ssgOptions` 仍然支持，但形状改为 `ValaxySSGOptions`：`concurrency`、`includedRoutes`、`includeAllRoutes`、`onBeforePageRender`、`onPageRendered`、`onFinished`。`vite-ssg` 专属选项（`dirStyle`、`beastiesOptions`、`formatting`、`script`）不再存在。
- **Critical CSS 内联（beasties）已移除。** 首屏无样式闪烁改由 FOUC guard 处理（`build.foucGuard`）。
- 如需目录式输出（`/foo/index.html`），请用目录索引页（`pages/foo/index.md`）替代旧的 `dirStyle: 'nested'` 选项。

### 音乐播放器迁移至 `valaxy-addon-meting` {#music-player-addon}

内置的 `aplayer: true` frontmatter 开关不再加载音乐播放器。请安装并启用该插件：

```ts
// valaxy.config.ts
import { addonMeting } from 'valaxy-addon-meting'

export default defineValaxyConfig({
  addons: [addonMeting()],
})
```

Markdown 中 `<meting-js>` 的用法不变。参见 [音乐播放器](/zh/guide/third-party#music-player)。

### 配置与 frontmatter 移除 {#config-frontmatter-removals}

- **顶层 `ignoreDeadLinks`** → 改用 `build.ignoreDeadLinks`。
- **`unocssPresets.uno`** → 改用 `unocssPresets.wind4`（自 wind3→wind4 迁移后它早已失效）。
- **frontmatter `color`**（标题颜色）已从核心类型移除。它属于主题范畴——`valaxy-theme-yun` 运行时仍读取它；建议改用 `pageTitleClass` / `postTitleClass`。

### SSR 全局对象 {#ssr-globals}

如果某个主题或插件依赖旧引擎的 JSDOM（它在 SSR 期间默默提供 `window` / `document` / `navigator`），请守护这些访问——当前引擎以纯字符串渲染、没有 DOM。参见 [SSR 兼容性](/zh/guide/ssr-compat)。

## v0.21.0 {#v0210}

### 自行引入公共样式 {#自行引入公共样式}

主题开发者需要自行引入公共样式 `valaxy/client/styles/common/index.scss`。

参见 [引入默认样式](/zh/themes/write#引入默认样式)。

