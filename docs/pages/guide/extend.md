---
title: Extend
title_zh: 自定义扩展
categories:
  - Guide
end: false
---

Todo:

- [ ] English

Valaxy 以约定大于配置的方式提供了强大的扩展功能，如果你有一定开发经验，可以自定义控制站点的每一处细节。

> 以下内容无论对于用户还是主题开发者来说都同样适用。

::: tip
默认在用户站点根目录或主题根目录下操作。

如果你想要有所参考，你可以参见 [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun)。
:::

## 自动组件注册

新建 `components` 文件夹，书写任意 Vue 组件。
它们会被自动注册，你甚至可以在你的 Markdown 文件中使用它。

如果存在与主题、Valaxy 的同名组件，覆盖顺序为 `用户目录` -> `主题目录` -> `Valaxy 客户端目录`。
这也意味着你可以只覆盖主题的某个组件，来达到自定义局部主题的效果！

### 自定义覆盖主题组件

基于此，你可以非常容易地自定义主题的任何地方！

譬如自定义页脚：

> 可参见 [demo/yun/components/YunFooter.vue | GitHub](https://github.com/YunYouJun/valaxy/blob/main/demo/yun/components/YunFooter.vue)

在博客文件夹中 `components` 目录下，新建 `YunFooter.vue` 覆盖你的主题页脚文件。

你可以直接替换掉页脚内容：

```vue
<template>
  <div>页脚内容</div>
</template>
```

也可以继承扩展此前的页脚：

```vue
<script lang="ts" setup>
import YunFooter from 'valaxy-theme-yun/components/YunFooter.vue'
</script>

<template>
  <YunFooter>
    自定义页脚内容
  </YunFooter>
</template>
```

## 自动布局注册

基于 [vite-plugin-vue-layouts](https://github.com/JohnCampionJr/vite-plugin-vue-layouts)，Valaxy 提供了布局功能。

新建 `layouts` 文件，书写 Vue 组件作为布局。

你可以在 Markdown 中如下使用它。

```md
---
title: Photos
layout: album
---
```

同样，当存在同名布局时，覆盖顺序为 `用户目录` -> `主题目录` -> `Valaxy 客户端目录`。

## 自动样式注入

新建 `styles` 文件夹，目录下的以下文件将会被自动引入：

- `index.scss`
- `index.css`
- `css-vars.scss`
- `css-vars.css`

我们推荐您：

- 新建 `index.scss` 书写全局样式，并可在其中导入其他样式，它会被自动引入。
- 新建 `css-vars.scss` 书写 CSS 变量，它会被自动引入。

## 自定义 index.html

新建 `index.html`，你可以在 `<head></head>` 与 `<body></body>` 全局地插入任意内容。

譬如：

```html
<head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/star-markdown-css/dist/planet/planet-markdown.min.css"
  />
</head>
```

## 扩展 Client 上下文

新建 `setup/main.ts`：

```ts
import { defineAppSetup } from 'valaxy'

export default defineAppSetup((ctx) => {
  console.log(ctx)
  const { app, head, router, routes, isClient } = ctx
  // 任意使用 Vue 生态的插件
  app.use(/* */)
})
```

## 多语言支持

新建 `locales` 文件夹。

- `zh-CN.yml`: 中文翻译
- `en.yml`: 英文翻译

譬如（请确保文件内容非空）：

```yaml
# en.yml
button:
  about: About
```

```yaml
# zh-CN.yml
button:
  about: 关于
```

你可以如下方式使用它：

```vue
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

## 模版文件

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
