---
title: 自定义扩展
categories:
  - custom
end: false
---

Valaxy 以约定大于配置的方式提供了强大的扩展功能，如果你有一定开发经验，可以自定义控制站点的每一处细节。



> 以下内容无论对于用户还是主题开发者来说都同样适用。

::: tip
默认在用户站点根目录或主题根目录下操作。

如果你想要有所参考，你可以参见 [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun)。
:::



## 自动布局注册 {#automatic-layout-registration}


基于 [vite-plugin-vue-layouts-next](https://github.com/loicduong/vite-plugin-vue-layouts-next)，Valaxy 提供了布局功能。

新建 `layouts` 文件，书写 Vue 组件作为布局。

你可以在 Markdown 中如下使用它。


```md [pages/album.md]
---
title: Photos
layout: album
---
```

同样，当存在同名布局时，覆盖顺序为 `用户目录` -> `主题目录` -> `Valaxy 客户端目录`。


## 自定义 index.html {#customizing-indexhtml}


新建 `index.html`，你可以在 `<head></head>` 与 `<body></body>` 全局地插入任意内容。

譬如：


```html [index.html]
<head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/star-markdown-css/dist/planet/planet-markdown.min.css"
  />
</head>
```

## 扩展 Client 上下文 {#extending-client-context}


新建 `setup/main.ts`：

```ts [setup/main.ts]
import { defineAppSetup } from 'valaxy'

export default defineAppSetup((ctx) => {
  console.log(ctx)
  const { app, head, router, routes, isClient } = ctx
  // 任意使用 Vue 生态的插件
  app.use(/* */)
})
```

> 具体示例可参见 [谷歌统计｜第三方集成](/zh/guide/third-party/#谷歌统计)。


## 覆盖 App 组件 {#overriding-app-component}


你可以在站点根目录下创建 `App.vue` 文件来完全覆盖默认的应用组件。主题开发者也可以在主题根目录下提供 `App.vue`。

覆盖优先级为：**用户** > **主题** > **核心**。

::: warning
覆盖 App 组件会替换掉默认的 SEO 设置（由 `useValaxyApp()` 提供）和默认的 `<router-view>`，你需要自行处理这些内容。

大多数情况下，推荐使用 `setup/main.ts`（参见上方 [扩展 Client 上下文](#extending-client-context)）。仅在需要深度自定义应用外壳时才使用完整的 `App.vue` 覆盖。
:::

```vue [App.vue]
<script setup lang="ts">
import { useValaxyApp } from 'valaxy'

// 调用 useValaxyApp() 以保留默认的 SEO 行为
useValaxyApp()
</script>

<template>
  <router-view />
</template>
```


## 多语言支持 {#i18n}


新建 `locales` 文件夹。

- `zh-CN.yml`: 中文翻译
- `en.yml`: 英文翻译

譬如（请确保文件内容非空）：


```yaml [locales/en.yml]
button:
  about: About
```

```yaml [locales/zh-CN.yml]
button:
  about: 关于
```

你可以如下方式使用它：


```vue [components/CustomButton.vue]
<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <button>
    {{ t('button.about') }}
  </button>
</template>
```

## 模版文件 {#template-files}


新建某类布局 Markdown 文件的模版。（开发中）

新建 `scaffolds` 文件夹。


```bash
valaxy new <title> -l [layout]
```


- `layout`: 默认为 `post`

新建 `xxx.md`，xxx 取决于你的布局名称。
譬如 `album.md` 代表 `layout: album`。


```bash
valaxy new my-young -l album
```

## 其他 {#others}



- [自定义样式 | Valaxy](/zh/guide/custom/styles)



