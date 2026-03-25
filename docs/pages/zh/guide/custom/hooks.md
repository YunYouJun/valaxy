---
title: 钩子
categories:
  - custom
end: false
---

::: tip

Valaxy 提供了钩子系统，以便你可以对生命周期的各个阶段进行定制。

:::


## 生命周期 {#lifecycle}

> 钩子的生命周期以排列顺序执行。

### Build Time {#build-time}

| Hook | Arguments | Description |
| ---- | --------- | ----------- |
| `options:resolved` |  | 在 Valaxy 配置解析之后执行。|
| `config:init` |  | 在 Vite 配置初始化（根据 Valaxy Options 进行初始化）之后执行。|
| `vue-router:extendRoute` | `route: EditableTreeNode` | 在扩展每个路由时执行（`.md` 页面的 frontmatter/excerpt 处理完成之后）。|
| `vue-router:beforeWriteFiles` | `root: EditableTreeNode` | 在路由文件写入之前执行。|
| `md:afterRender` | `ctx: MdAfterRenderContext` | 在 Markdown 页面加载并解析 frontmatter/excerpt 之后执行。适用于需要检查或扩展页面元数据的插件。|
| `build:before` |  | 在构建开始之前执行。仅在 `valaxy build` 时触发。|
| `build:after` |  | 在构建完成之后执行。仅在 `valaxy build` 时触发。|
| `content:before-load` | | `@experimental` 在所有 Content Loader 开始获取之前触发。|
| `content:loaded` | | `@experimental` 在所有 Content Loader 完成之后触发。|

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  hooks: {
    'config:init': () => {
      console.log('config:init')
    },
  }
})
```

### App Client {#app-client}

Valaxy 目前没有客户端 hooks 系统。客户端扩展通过 `defineAppSetup` 完成，它提供 `AppContext`（包括 `app`、`router`、`routes` 等）用于定制 Vue 应用。

```ts [setup/main.ts]
import { defineAppSetup } from 'valaxy'

export default defineAppSetup(({ app, router, routes }) => {
  // 安装 Vue 插件、注册全局组件等
})
```

