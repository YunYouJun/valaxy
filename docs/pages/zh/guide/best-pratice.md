---
title: 最佳实践
categories:
  - guide
top: 1
---

以下建议可以让 Valaxy 博客更容易迁移，并减少只在生产环境出现的问题。它们是推荐约定，并非强制要求。

## 项目与依赖 {#project-and-dependencies}

- 使用 Valaxy 支持的 Node.js 版本，并让本地与 CI 保持一致。当前版本要求请查看[快速上手](/zh/guide/getting-started)。
- 整个项目只使用一种包管理器。推荐使用 `pnpm`，并提交 `pnpm-lock.yaml`，让本地和 CI 安装相同的依赖关系。
- 配置文件或组件中直接导入的包，都应添加到博客自身的 `package.json`。不要依赖由 Valaxy、主题或其他插件间接安装的包。
- 升级时尽量同步升级 Valaxy、官方主题与插件，并在升级后执行一次生产构建。

## 文章与资源 {#posts-and-assets}

建议使用稳定、适合作为 URL 的英文名称命名文件夹和文件：

```txt
blog/pages/posts/your-post.md
```

本地文章资源建议与文章放在同一文件夹，并使用相对路径引用。这样既便于迁移，也能让 Vite 在页面和生成的订阅内容中正确处理资源。

```txt
pages/posts/your-post
├── a.png
├── b.png
└── index.md
```

```md [pages/posts/your-post/index.md]
![图片 A](./a.png)
![图片 B](./b.png)
```

站点部署到子路径时，Markdown 中的根绝对链接会自动适配。在 Vue 组件中动态生成 URL 时，请使用 `withBase()`。详见[部署到子路径](/zh/guide/deploy#deploy-under-base-path)。

## 动态与第三方内容 {#dynamic-and-third-party-content}

插入第三方脚本或大量动态内容时，优先将其封装为 `components/` 中的 Vue 组件，再从 Markdown 使用组件。这样可以把副作用留在文章之外，并集中处理加载、错误和清理逻辑。

```bash
pnpm add @vueuse/core
```

```vue [components/BszComponent.vue]
<script lang="ts" setup>
import { useScriptTag } from '@vueuse/core'

useScriptTag('https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js')
</script>

<template>
  <div>
    <div>本站总访问量 <span id="busuanzi_value_site_pv" /> 次</div>
    <div>本站访客数 <span id="busuanzi_value_site_uv" /> 人次</div>
  </div>
</template>
```

```md [pages/posts/test-custom-component.md]
# Hello World

<BszComponent />
```

Valaxy 使用 SSR 生成页面。如果第三方库会访问 `window`、`document` 等浏览器 API，请在挂载后初始化，或通过仅客户端组件加载。详见 [SSR 兼容性](/zh/guide/ssr-compat)。

## 选择最小的扩展层级 {#choose-the-smallest-extension-level}

| 需求 | 推荐方式 |
| --- | --- |
| 已支持的 Markdown 语法，例如图表 | 优先使用内置能力，例如 [Mermaid](/zh/guide/markdown#mermaid) |
| 仅在一个博客使用的库或挂件 | 在 `components/` 中创建本地组件 |
| 多个博客共用的通用组件 | 发布组件包，或贡献到 `valaxy-addon-components` |
| 需要 Markdown 转换、构建钩子、共享配置或自动注册组件 | [编写插件](/zh/addons/write) |

简单的思维导图可以直接使用内置的 [Mermaid 思维导图示例](/zh/examples/mermaid#mindmap)。使用 Markmap 时，建议先通过 `markmap-lib` 与 `markmap-view` 编写本地 `Markmap.vue` 组件，并仅在客户端初始化。当它还需要提供 `markmap` 代码围栏、统一的主题与工具栏配置、资源处理和 SSR 安全的生命周期时，再独立为 addon 才有明显收益。在此之前，addon 会增加安装和维护成本，却不能显著减少用户代码。

## 部署前验证 {#verify-before-deployment}

开发模式无法暴露所有 SSR、依赖和子路径问题。部署前请执行：

```bash
pnpm build
pnpm serve
```

至少检查首页、直接打开或刷新后的文章页、包含第三方内容的页面；如果配置了 `vite.base`，还应在实际生产子路径下检查。

反馈问题时，请提供最小复现、完整错误信息、问题发生在开发还是生产环境，以及以下命令生成的环境信息：

```bash
pnpm exec valaxy debug --plain
```
